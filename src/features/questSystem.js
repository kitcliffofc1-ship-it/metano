const { EmbedBuilder } = require('discord.js')
const db = require('../utils/supabase')
const logger = require('../utils/logger')

const questPool = [
  { id: 'chat', name: 'Chatter', desc: 'Kirim 10 pesan di channel mana aja', target: 10, reward: { xp: 50, g: 25 } },
  { id: 'react', name: 'Reaktor', desc: 'Reaksi 3 pesan orang lain', target: 3, reward: { xp: 40, g: 20 } },
  { id: 'command', name: 'Sosmed', desc: 'Gunakan 3 command Metano', target: 3, reward: { xp: 60, g: 30 } },
  { id: 'shopper', name: 'Pembeli', desc: 'Beli 1 item di /shop', target: 1, reward: { xp: 90, g: 50 } },
  { id: 'daily', name: 'Rajin', desc: 'Klaim /daily hari ini', target: 1, reward: { xp: 30, g: 20 } },
  { id: 'work', name: 'Pekerja Keras', desc: 'Gunakan /work', target: 1, reward: { xp: 40, g: 30 } },
]

const activeRounds = new Map()
const questProgress = new Map()

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function generateRoundId() {
  return `round_${Date.now()}`
}

function progressKey(userId, roundId, questId) {
  return `${userId}:${roundId}:${questId}`
}

function getAllActiveQuests(userId, guildId) {
  const result = []
  for (const [roundId, round] of activeRounds) {
    if (round.guildId !== guildId) continue
    for (const quest of round.quests) {
      const key = progressKey(userId, roundId, quest.id)
      const current = questProgress.get(key) || 0
      if (current < quest.target) {
        result.push({ roundId, quest, current })
      }
    }
  }
  return result
}

async function trackProgress(userId, guildId, questId, channel) {
  for (const [roundId, round] of activeRounds) {
    if (round.guildId !== guildId) continue

    const quest = round.quests.find(q => q.id === questId)
    if (!quest) continue

    const key = progressKey(userId, roundId, quest.id)
    const current = (questProgress.get(key) || 0) + 1
    questProgress.set(key, current)

    if (current >= quest.target) {
      const existing = db.hasQuestLog(userId, guildId, questId, roundId)
      if (existing) continue

      db.addQuestLog(userId, guildId, questId, roundId)
      const user = db.getUser(userId, guildId)
      db.updateUser(userId, guildId, {
        balance: user.balance + quest.reward.g,
        xp: user.xp + quest.reward.xp
      })

      if (channel) {
        await channel.send({
          content: `★ **<@${userId}>** menyelesaikan quest **${quest.name}**! Dapet **${quest.reward.xp} XP** + **${quest.reward.g} G**!`
        }).catch(() => {})
      }
    }
  }
}

async function postQuests(client, guildId) {
  try {
    const guildData = await db.getGuild(guildId)
    const channelId = guildData.quest_channel
    if (!channelId) return false

    const channel = client.channels.cache.get(channelId)
    if (!channel) return false

    const guild = client.guilds.cache.get(guildId)
    if (!guild) return false

    const oldMsgs = await channel.messages.fetch({ limit: 50 }).catch(() => [])
    const botMsgs = oldMsgs.filter(m => m.author.id === client.user.id)
    if (botMsgs.size > 0) {
      await channel.bulkDelete(botMsgs).catch(() => {})
    }

    const count = Math.floor(Math.random() * 3) + 3
    const quests = pickRandom(questPool, count)
    const roundId = generateRoundId()

    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle('★ Meta Shows — Quest Aktif')
      .setDescription(
        quests.map((q, i) => `**${i + 1}.** ${q.name}\n└ ${q.desc}\n  Reward: **${q.reward.xp} XP** + **${q.reward.g} G**`).join('\n\n')
      )
      .setFooter({ text: `Metano • Selesaikan quest buat dapet reward! • ${30} menit` })

    const msg = await channel.send({ embeds: [embed] })

    activeRounds.set(roundId, {
      guildId,
      messageId: msg.id,
      channelId,
      quests,
      expiresAt: Date.now() + 30 * 60 * 1000
    })

    setTimeout(async () => {
      const fetched = await channel.messages.fetch({ limit: 50 }).catch(() => [])
      const toDelete = [...fetched.values()]
      if (toDelete.length > 1) {
        await channel.bulkDelete(toDelete).catch(() => {})
      } else if (toDelete.length === 1) {
        await toDelete[0].delete().catch(() => {})
      }

      const closedEmbed = new EmbedBuilder()
        .setColor(0x444444)
        .setTitle('★ Shows Closed')
        .setDescription('Sesi quest telah berakhir. Tunggu sesi berikutnya!')
        .setFooter({ text: 'Metano' })

      await channel.send({ embeds: [closedEmbed] }).catch(() => {})

      for (const [key] of questProgress) {
        if (key.includes(roundId)) questProgress.delete(key)
      }
      activeRounds.delete(roundId)
    }, 30 * 60 * 1000)

    return true
  } catch (error) {
    logger.error(`Quest post error for guild ${guildId}: ${error.message}`)
    return false
  }
}

function startQuestScheduler(client) {
  const guildIds = new Set()
  client.guilds.cache.forEach(g => guildIds.add(g.id))

  const post = () => {
    guildIds.forEach(id => postQuests(client, id).catch(() => {}))
  }

  post()
  setInterval(post, 2 * 60 * 60 * 1000)
  logger.info('Quest system started — auto-track mode')
}

module.exports = { startQuestScheduler, activeRounds, postQuests, trackProgress, getAllActiveQuests }
