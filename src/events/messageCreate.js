const db = require('../utils/supabase')
const config = require('../config')
const logger = require('../utils/logger')
const { trackProgress } = require('../features/questSystem')

const cooldowns = new Map()
const { getXpForLevel } = require('../commands/leveling/rank')

const blockedWords = [
  'sex', 'porn', 'nsfw', 'bokep',
  'kntl', 'kontol', 'mmk', 'memek', 'ngentot', 'ngntot', 'bajingan', 'bjngn',
  'anjing', 'njing', 'anjink', 'babi',
  'negro', 'niga', 'niger', 'njir',
  'asu', 'bangsat', 'bsat',
]

module.exports = {
  async execute(message) {
    if (message.author.bot) return

    const lower = message.content.toLowerCase()
    const found = blockedWords.find(w => lower.includes(w))
    if (found) {
      await message.delete().catch(() => {})
      const warn = await message.channel.send({
        content: `♢ **${message.author.username}**, kata itu gak boleh di sini.`
      }).catch(() => {})
      setTimeout(() => warn?.delete().catch(() => {}), 5000)
      return
    }

    const guildData = await db.getGuild(message.guildId)
    const questChannelId = guildData.quest_channel

    if (questChannelId && message.channel.id === questChannelId) {
      setTimeout(async () => {
        await message.delete().catch(() => {})
      }, 5 * 60 * 1000)
    }

    trackProgress(message.author.id, message.guildId, 'chat', message.channel)

    const cooldown = 60 * 1000
    const key = `${message.author.id}-${message.guildId}`
    const now = Date.now()

    if (cooldowns.has(key) && now - cooldowns.get(key) < cooldown) return
    cooldowns.set(key, now)

    const xpGain = Math.floor(Math.random() * 15) + 5
    const user = await db.getUser(message.author.id, message.guildId)
    const newXp = user.xp + xpGain
    let newLevel = user.level
    let leveledUp = false

    while (newXp >= getXpForLevel(newLevel)) {
      newLevel++
      leveledUp = true
    }

    await db.updateUser(message.author.id, message.guildId, { xp: newXp, level: newLevel })

    if (leveledUp) {
      await message.channel.send({
        content: `※ Selamat **${message.author.username}**, naik ke **level ${newLevel}**!`
      }).catch(() => {})
    }
  }
}
