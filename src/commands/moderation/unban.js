const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban member')
    .addStringOption(opt => opt.setName('user_id').setDescription('ID user yang mau di-unban').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('user_id')

    const bans = await interaction.guild.bans.fetch()
    const banned = bans.get(userId)
    if (!banned) return interaction.reply({ content: 'User ini gak ada di ban list.', ephemeral: true })

    await interaction.guild.members.unban(userId)
    const embed = new EmbedBuilder()
      .setColor(0x44ff44)
      .setTitle('Member Unbanned')
      .setDescription(`**${banned.user.tag}** telah di-unban.`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
