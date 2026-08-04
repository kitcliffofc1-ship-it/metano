const logger = require('../utils/logger')
const { toWingdings } = require('./wingdings')

const blockedWords = [
  'sex', 'porn', 'nsfw', 'bokep',
  'kntl', 'kontol', 'mmk', 'memek', 'ngentot', 'ngntot', 'bajingan', 'bjngn',
  'anjing', 'njing', 'anjink', 'babi',
  'negro', 'niga', 'niger', 'njir',
  'asu', 'bangsat', 'bsat',
]

const patrolPhrases = [
  'haunting for mischief',
  'keeping this place in order',
  '0 ATK 0 DEF, still terrifying',
  'watching. always watching.',
  'dramatically spooky',
]

const quips = [
  'NYEH HEH HEH! The GREAT PAPYRUS saw that coming from a mile away.',
  'Careful, human. I may be 0 ATK, but I have deleted things with 99 ATK.',
  'A phantom never sleeps. I simply hover menacingly.',
  'Dust yourself off, human. That was pitiful.',
  'Bored. Mostly bored. You are not helping.',
  'I have seen combat. I have seen DUST. You, human, are neither.',
  'NYEH! Magnificent, was it not?',
  'Your aura is weak, but your determination is... tolerable.',
]

const TRUSTED_ROLE = '♢ trusted'
const TRUST_MINUTES = 30
const RAID_JOIN_WINDOW = 15

const joinTimestamps = new Map()
const msgTimestamps = new Map()
const spamState = new Map()
const db = require('../utils/supabase')

function track(userId, windowMs = 5000) {
  const now = Date.now()
  const arr = (msgTimestamps.get(userId) || []).filter(t => now - t < windowMs)
  arr.push(now)
  msgTimestamps.set(userId, arr)
  return arr.length
}

async function warn(channel, text) {
  const wText = toWingdings(text, 'lower')
  const warnMsg = await channel.send({ content: `☠❄☟ ${wText}` }).catch(() => null)
  setTimeout(() => warnMsg?.delete().catch(() => {}), 8000)
}

async function ensureTrustedRole(guild) {
  let role = guild.roles.cache.find(r => r.name === TRUSTED_ROLE)
  if (!role) {
    role = await guild.roles.create({
      name: TRUSTED_ROLE,
      color: 0x1a1a2e,
      hoist: false,
      mentionable: false,
      permissions: [],
      reason: 'ghostpaps: trusted member marker'
    }).catch(() => null)
  }
  return role
}

async function grantTrusted(member) {
  if (member.user.bot) return
  if (member.roles.cache.has(TRUSTED_ROLE)) return
  const role = await ensureTrustedRole(member.guild)
  if (!role) return
  await member.roles.add(role, 'ghostpaps: member earned trust').catch(() => {})
}

async function sweepTrusted(guild) {
  const role = await ensureTrustedRole(guild).catch(() => null)
  if (!role) return

  for (const member of guild.members.cache.values()) {
    if (member.user.bot) continue
    if (member.roles.cache.has(role.id)) continue
    const joinedAt = member.joinedAt?.getTime() || 0
    if (Date.now() - joinedAt > TRUST_MINUTES * 60 * 1000) {
      await member.roles.add(role, 'ghostpaps: member earned trust').catch(() => {})
    }
  }
}

function startPatrol(client) {
  logger.info('♡ Ghostpaps patrol started — haunting...')

  setInterval(async () => {
    const guild = client.guilds.cache.first()
    if (!guild) return

    const channels = guild.channels.cache.filter(c =>
      c.isTextBased() && c.viewable && c.permissionsFor(client.user)?.has('SendMessages')
    )
    if (channels.size === 0) return

    const channel = channels.at(Math.floor(Math.random() * channels.size))
    const phrase = patrolPhrases[Math.floor(Math.random() * patrolPhrases.length)]
    client.user.setActivity(`♢ ${phrase} in #${channel.name}`, { type: 3 })
  }, 30 * 1000)

  setInterval(async () => {
    const guild = client.guilds.cache.first()
    if (!guild) return
    await sweepTrusted(guild)
    for (const [id] of msgTimestamps) {
      if (Date.now() - msgTimestamps.get(id)[msgTimestamps.get(id).length - 1] > 60000) msgTimestamps.delete(id)
    }
    for (const [id, state] of spamState) {
      if (Date.now() - state.lastBurst > 60000) spamState.delete(id)
    }
  }, 10 * 60 * 1000)
}

async function handleBotFlood(msg) {
  const count = track(msg.author.id)
  if (count < 5) return

  const member = msg.guild.members.cache.get(msg.author.id)
  const recent = await msg.channel.messages.fetch({ limit: 10 }).catch(() => [])
  const toDelete = recent.filter(m => m.author.id === msg.author.id)
  for (const m of toDelete.values()) await m.delete().catch(() => {})

  await member?.timeout(10 * 60 * 1000, 'ghostpaps: bot spam detected').catch(() => {})
  await warn(msg.channel, 'a bot attempted to raid this server. droll. absolutely droll. dealt with.')
}

async function handleMessage(client, msg) {
  if (msg.author.id === client.user.id) return
  const member = msg.member
  if (!member) return
  if (member.permissions.has('ManageMessages')) return

  if (msg.author.bot) return handleBotFlood(msg)

  const role = await ensureTrustedRole(msg.guild).catch(() => null)
  if (role && !member.roles.cache.has(role.id)) {
    try {
      const user = db.getUser(msg.author.id, msg.guild.id)
      if (user.level >= 2) await member.roles.add(role, 'ghostpaps: proven active')
    } catch {}
  }

  const lower = msg.content.toLowerCase()

  const blocked = blockedWords.find(w => lower.includes(w))
  if (blocked) {
    await msg.delete().catch(() => {})
    await warn(msg.channel, 'careful. something foul slipped through. it has been DELETED.')
    return
  }

  if (/discord\.(gg\/|me\/|com\/invite\/)/i.test(lower)) {
    await msg.delete().catch(() => {})
    await warn(msg.channel, 'advertise elsewhere, human. this territory is under superior management.')
    return
  }

  const mentionCount = msg.mentions.users.size + msg.mentions.roles.size
  if (mentionCount >= 5 || msg.mentions.everyone) {
    await msg.delete().catch(() => {})
    await warn(msg.channel, 'spamming mentions will not earn you friends, human. it WILL earn you deletion.')
    return
  }

  const customEmojis = (msg.content.match(/<a?:[a-zA-Z0-9_]+:\d+>/g) || []).length
  const unicodeEmojis = (msg.content.match(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F02F}\u{2600}-\u{27BF}\uFE0F]/gu) || []).length
  if (customEmojis + unicodeEmojis >= 8) {
    await msg.delete().catch(() => {})
    await warn(msg.channel, 'emojis do not make you menacing, human. they make you laggy. DELETED.')
    return
  }

  const count = track(msg.author.id)
  if (count >= 6) {
    const state = spamState.get(msg.author.id) || { strikes: 0, lastBurst: 0 }
    const now = Date.now()
    if (now - state.lastBurst > 60000) state.strikes = 0
    state.lastBurst = now
    state.strikes++
    spamState.set(msg.author.id, state)

    if (state.strikes === 1) {
      await warn(msg.channel, 'slow down, human. this is a conversation, not a stress test. NYEH HEH HEH!')
    } else if (state.strikes === 2) {
      await msg.delete().catch(() => {})
      const recent = await msg.channel.messages.fetch({ limit: 10 }).catch(() => [])
      const toDelete = recent.filter(m => m.author.id === msg.author.id && m.id !== msg.id)
      for (const m of toDelete.values()) await m.delete().catch(() => {})
      await warn(msg.channel, 'still going, human? then it gets DELETED. one more burst and you take a nap.')
    } else {
      await msg.delete().catch(() => {})
      const recent = await msg.channel.messages.fetch({ limit: 10 }).catch(() => [])
      const toDelete = recent.filter(m => m.author.id === msg.author.id && m.id !== msg.id)
      for (const m of toDelete.values()) await m.delete().catch(() => {})
      await msg.member?.timeout(10 * 60 * 1000, 'ghostpaps: message spam').catch(() => {})
      await warn(msg.channel, 'you had your chances, human. sleep it off.')
    }
    return
  }

  if (Math.random() < 0.02) {
    msg.channel.send(quips[Math.floor(Math.random() * quips.length)]).catch(() => {})
  }
}

async function checkRaid(member) {
  const now = Date.now()
  const guildId = member.guild.id
  if (!joinTimestamps.has(guildId)) joinTimestamps.set(guildId, [])
  joinTimestamps.get(guildId).push(now)
  const recent = joinTimestamps.get(guildId).filter(t => now - t < 10000)
  joinTimestamps.set(guildId, recent)

  if (recent.length < 5) return
  joinTimestamps.set(guildId, [])

  const guild = member.guild
  const channel = guild.channels.cache.find(c =>
    c.isTextBased() && c.permissionsFor(guild.members.me)?.has('SendMessages')
  )
  if (channel) {
    channel.send({
      content: `☠⚐☠❄ ${toWingdings('so many humans at once. clearly suspicious. locking down.', 'lower')}`
    }).catch(() => {})
  }

  const prevSlowmodes = []
  for (const ch of guild.channels.cache.filter(c => c.isTextBased() && c.manageable).values()) {
    prevSlowmodes.push({ id: ch.id, rate: ch.rateLimitPerUser })
    ch.setRateLimitPerUser(5, 'ghostpaps anti-raid').catch(() => {})
  }

  const prevVerification = guild.verificationLevel
  guild.setVerificationLevel(2, 'ghostpaps anti-raid').catch(() => {})

  const trustedRole = await ensureTrustedRole(guild).catch(() => null)
  const cutoff = Date.now() - RAID_JOIN_WINDOW * 60 * 1000
  let locked = 0
  for (const member of guild.members.cache.values()) {
    if (member.user.bot) continue
    if (trustedRole && member.roles.cache.has(trustedRole.id)) continue
    const joinedAt = member.joinedAt?.getTime() || 0
    if (joinedAt < cutoff) continue
    await member.timeout(15 * 60 * 1000, 'ghostpaps: raid lockdown').catch(() => {})
    locked++
  }
  logger.warn(`♡ Raid lockdown — ${locked} untrusted recent joiners timed out in ${guild.name}`)

  setTimeout(() => {
    for (const entry of prevSlowmodes) {
      guild.channels.cache.get(entry.id)?.setRateLimitPerUser(entry.rate, 'ghostpaps anti-raid lifted').catch(() => {})
    }
    guild.setVerificationLevel(prevVerification, 'ghostpaps anti-raid lifted').catch(() => {})
  }, 5 * 60 * 1000)
}

function startAntiRaid(client) {
  client.on('guildMemberAdd', member => {
    if (member.user.bot) return
    checkRaid(member)
    setTimeout(async () => {
      if (!member.guild) return
      const fresh = await member.guild.members.fetch(member.id).catch(() => null)
      if (fresh) await grantTrusted(fresh)
    }, TRUST_MINUTES * 60 * 1000)
  })
  client.on('messageCreate', msg => handleMessage(client, msg))
  logger.info('♡ Ghostpaps anti-raid active')
}

module.exports = { startPatrol, startAntiRaid }
