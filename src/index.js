require('dotenv').config()
const { Client, GatewayIntentBits, Partials } = require('discord.js')
const { loadCommands } = require('./handlers/commandHandler')
const { loadEvents } = require('./handlers/eventHandler')
const logger = require('./utils/logger')
const db = require('./utils/supabase')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
})

;(async () => {
  await db.initDB()
  logger.info('Database initialized')

  loadCommands()
  loadEvents(client)

  client.login(process.env.DISCORD_TOKEN).catch(err => {
    logger.error(`Failed to login: ${err.message}`)
    process.exit(1)
  })
})()
