require('dotenv').config()
const { Client, GatewayIntentBits, Partials } = require('discord.js')
const { loadCommands } = require('./handlers/commandHandler')
const { loadEvents } = require('./handlers/eventHandler')
const logger = require('./utils/logger')
const db = require('./utils/supabase')
const { startGhostpaps } = require('./ghostpaps')

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

  try {
    const { REST, Routes } = require('discord.js')
    const { readdirSync } = require('fs')
    const { join } = require('path')
    const config = require('./config')
    const commands = []
    const categories = readdirSync(join(__dirname, 'commands'))
    for (const category of categories) {
      const catPath = join(__dirname, 'commands', category)
      for (const file of readdirSync(catPath).filter(f => f.endsWith('.js'))) {
        const cmd = require(join(catPath, file))
        commands.push(cmd.data.toJSON())
      }
    }
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)
    await rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    logger.info(`Auto-registered ${commands.length} commands`)
  } catch (err) {
    logger.error(`Auto-register failed: ${err.message}`)
  }

  startGhostpaps(process.env.GHOSTPAPS_TOKEN)
})()
