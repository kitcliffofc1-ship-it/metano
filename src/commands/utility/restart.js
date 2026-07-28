const { SlashCommandBuilder, PermissionFlagsBits, REST, Routes } = require('discord.js')
const { readdirSync } = require('fs')
const { join } = require('path')
const logger = require('../../utils/logger')
const config = require('../../config')

async function registerCommands() {
  const commands = []
  const categories = readdirSync(join(__dirname, '..', '..', 'commands'))
  for (const category of categories) {
    const categoryPath = join(__dirname, '..', '..', 'commands', category)
    const commandFiles = readdirSync(categoryPath).filter(f => f.endsWith('.js'))
    for (const file of commandFiles) {
      delete require.cache[require.resolve(join(categoryPath, file))]
      const command = require(join(categoryPath, file))
      commands.push(command.data.toJSON())
    }
  }

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)
  await rest.put(Routes.applicationCommands(config.clientId), { body: commands })
  return commands.length
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart bot + register ulang commands')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })

    try {
      const count = await registerCommands()
      await interaction.editReply(`♢ **${count}** command registered. Restarting...`)
      logger.info(`Restart by ${interaction.user.tag}`)
      setTimeout(() => process.exit(1), 1000)
    } catch (error) {
      logger.error(`Restart failed: ${error.message}`)
      await interaction.editReply({ content: '♢ Restart gagal.', ephemeral: true })
    }
  }
}
