const { readdirSync } = require('fs')
const { join } = require('path')
const logger = require('../utils/logger')

function loadEvents(client) {
  const eventFiles = readdirSync(join(__dirname, '..', 'events')).filter(f => f.endsWith('.js'))

  for (const file of eventFiles) {
    const event = require(join(__dirname, '..', 'events', file))
    const eventName = file.replace('.js', '')

    if (event.once) {
      client.once(eventName, (...args) => event.execute(...args, client))
    } else {
      client.on(eventName, (...args) => event.execute(...args, client))
    }

    logger.info(`Loaded event: ${eventName}`)
  }
}

module.exports = { loadEvents }
