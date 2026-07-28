const { readdirSync } = require('fs')
const { join } = require('path')
const logger = require('../utils/logger')

const commands = new Map()

function loadCommands() {
  const categories = readdirSync(join(__dirname, '..', 'commands'))

  for (const category of categories) {
    const categoryPath = join(__dirname, '..', 'commands', category)
    const commandFiles = readdirSync(categoryPath).filter(f => f.endsWith('.js'))

    for (const file of commandFiles) {
      const command = require(join(categoryPath, file))
      commands.set(command.data.name, command)
      logger.info(`Loaded command: ${command.data.name}`)
    }
  }

  return commands
}

module.exports = { loadCommands, commands }
