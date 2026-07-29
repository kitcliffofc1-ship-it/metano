const { Client, GatewayIntentBits, Partials } = require('discord.js')
const logger = require('../utils/logger')
const { startPatrol, startAntiRaid } = require('./patrol')

function startGhostpaps(token) {
  if (!token) {
    logger.warn('♡ GHOSTPAPS_TOKEN not set — Ghostpaps skipped')
    return
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Message, Partials.Channel]
  })

  client.once('ready', () => {
    logger.info(`♡ Ghostpaps is online! Logged in as ${client.user.tag} — ${client.user.username} has 0 ATK 0 DEF. Light shines straight through.`)
    client.user.setActivity('♢ Gentayangan... 0 ATK 0 DEF', { type: 3 })
    startPatrol(client)
    startAntiRaid(client)
  })

  client.login(token).catch(err => {
    logger.error(`♡ Ghostpaps failed to login: ${err.message}`)
  })
}

module.exports = { startGhostpaps }
