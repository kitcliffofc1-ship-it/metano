const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { postQuests } = require('../../features/questSystem')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quest')
    .setDescription('Munculin quest sekarang juga')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    const posted = await postQuests(interaction.client, interaction.guildId)
    if (!posted) {
      return interaction.editReply('★ Channel quest belum diset! Pakai `/setquestchannel` dulu.')
    }
    await interaction.editReply('★ Quest berhasil diposting!')
  }
}
