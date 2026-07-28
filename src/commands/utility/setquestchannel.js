const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setquestchannel')
    .setDescription('Set channel buat quest Meta Shows')
    .addChannelOption(opt => opt.setName('channel').setDescription('Channel quest').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel')
    await db.updateGuild(interaction.guildId, { quest_channel: channel.id })
    await interaction.reply({ content: `★ Quest channel diset ke ${channel}!`, ephemeral: true })
  }
}
