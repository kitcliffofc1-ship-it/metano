require('dotenv').config()
const { REST, Routes } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
const logger = require('../utils/logger')
const config = require('../config')

const commands = []
const categories = readdirSync(join(__dirname, '..', 'commands'))

for (const category of categories) {
  const categoryPath = join(__dirname, '..', 'commands', category)
  const commandFiles = readdirSync(categoryPath).filter(f => f.endsWith('.js'))
  for (const file of commandFiles) {
    const command = require(join(categoryPath, file))
    commands.push(command.data.toJSON())
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    logger.info(`Registering ${commands.length} commands...`)
    const data = await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    )
    logger.info(`Successfully registered ${data.length} commands.`)
  } catch (error) {
    logger.error(`Failed to register commands: ${error.message}`)
  }
})()
