const { commands } = require('../handlers/commandHandler')
const logger = require('../utils/logger')
const { trackProgress } = require('../features/questSystem')

const questCommandMap = {
  buy: 'shopper',
  daily: 'daily',
  work: 'work',
}

module.exports = {
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName)
      if (!command) return

      try {
        await command.execute(interaction)

        trackProgress(interaction.user.id, interaction.guildId, 'command', interaction.channel)

        const questId = questCommandMap[interaction.commandName]
        if (questId) {
          trackProgress(interaction.user.id, interaction.guildId, questId, interaction.channel)
        }
      } catch (error) {
        logger.error(`Error executing ${interaction.commandName}: ${error.message}`)
        const reply = { content: '♢ Error saat menjalankan command.', ephemeral: true }
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply)
        } else {
          await interaction.reply(reply)
        }
      }
      return
    }

    if (interaction.isButton()) {
      if (interaction.customId === 'shop_dismiss') {
        await interaction.update({ content: 'Shop ditutup.', embeds: [], components: [] })
        return
      }
      await interaction.reply({ content: '♢ Tombol gak dikenal.', ephemeral: true })
    }
  }
}
