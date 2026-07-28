const { trackProgress } = require('../features/questSystem')

module.exports = {
  async execute(reaction, user) {
    if (user.bot) return

    if (reaction.partial) {
      await reaction.fetch().catch(() => {})
    }

    if (!reaction.message.guild) return

    trackProgress(user.id, reaction.message.guildId, 'react', reaction.message.channel)
  }
}
