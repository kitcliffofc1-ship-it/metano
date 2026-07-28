const logger = require('../utils/logger')
const config = require('../config')
const { startQuestScheduler } = require('../features/questSystem')

const statuses = [
  { text: '/help | Metano', type: 3 },
  { text: '★ Meta Shows', type: 3 },
  { text: '♢ dengan ${guildCount} server', type: 3 },
  { text: 'chat-an sama member', type: 3 },
  { text: '♢ Quest — tahap uji coba', type: 3 },
  { text: '♢ Economy — masih beta', type: 3 },
]

module.exports = {
  once: true,
  execute(client) {
    logger.info(`${config.botName} is online! Logged in as ${client.user.tag}`)

    let i = 0
    const updateStatus = () => {
      const guildCount = client.guilds.cache.size
      const status = statuses[i % statuses.length]
      const text = status.text.replace('${guildCount}', guildCount)
      client.user.setActivity(text, { type: status.type })
      i++
    }

    updateStatus()
    setInterval(updateStatus, 30 * 1000)
    startQuestScheduler(client)
  }
}
