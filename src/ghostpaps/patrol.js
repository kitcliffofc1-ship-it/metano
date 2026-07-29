const logger = require('../utils/logger')
const { toWingdings } = require('./wingdings')

const blockedWords = [
  'sex', 'porn', 'nsfw', 'bokep',
  'kntl', 'kontol', 'mmk', 'memek', 'ngentot', 'ngntot', 'bajingan', 'bjngn',
  'anjing', 'njing', 'anjink', 'babi',
  'negro', 'niga', 'niger', 'njir',
  'asu', 'bangsat', 'bsat',
]

const joinTimestamps = new Map()

function startPatrol(client) {
  logger.info('♡ Ghostpaps patrol started — gentayangan...')

  const patrolPhrases = [
    'gentayangan',
    'cari yang aneh',
    'ngintip dikit',
    'was was terus',
    '0 atk 0 def',
  ]

  setInterval(async () => {
    const guild = client.guilds.cache.first()
    if (!guild) return

    const channels = guild.channels.cache.filter(c =>
      c.isTextBased() && c.viewable && c.permissionsFor(client.user)?.has('SendMessages')
    )

    if (channels.size === 0) return

    const channel = channels.at(Math.floor(Math.random() * channels.size))
    const phrase = patrolPhrases[Math.floor(Math.random() * patrolPhrases.length)]
    client.user.setActivity(`♢ ${phrase} di #${channel.name}`, { type: 3 })

    const messages = await channel.messages.fetch({ limit: 20 }).catch(() => [])
    if (!messages || messages.size === 0) return

    for (const msg of messages.values()) {
      if (msg.author.bot) continue

      const lower = msg.content.toLowerCase()
      const found = blockedWords.find(w => lower.includes(w))
      if (found) {
        await msg.delete().catch(() => {})
        const wText = toWingdings('hati hati ada yang mencurigakan', 'lower')
        const warn = await channel.send({
          content: `☠❄☟ ${wText}`
        }).catch(() => {})
        setTimeout(() => warn?.delete().catch(() => {}), 8000)
      }
    }
  }, 30 * 1000)
}

function checkRaid(member) {
  const now = Date.now()
  const guildId = member.guild.id
  if (!joinTimestamps.has(guildId)) joinTimestamps.set(guildId, [])

  const timestamps = joinTimestamps.get(guildId)
  timestamps.push(now)

  const recent = timestamps.filter(t => now - t < 10000)
  joinTimestamps.set(guildId, recent)

  if (recent.length >= 5) {
    const guild = member.guild
    const channel = guild.channels.cache.find(c =>
      c.isTextBased() && c.permissionsFor(guild.members.me)?.has('SendMessages')
    )
    if (channel) {
      channel.send({
        content: `☠⚐☠❄ ${toWingdings('banyak yang datang awas ada yang tidak beres', 'lower')}`
      }).catch(() => {})
    }
    joinTimestamps.set(guildId, [])
  }
}

function startAntiRaid(client) {
  client.on('guildMemberAdd', member => {
    if (member.user.bot) return
    checkRaid(member)
  })
  logger.info('♡ Ghostpaps anti-raid active')
}

module.exports = { startPatrol, startAntiRaid }
