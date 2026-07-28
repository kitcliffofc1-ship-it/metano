const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick member dari server')
    .addUserOption(opt => opt.setName('user').setDescription('User yang mau di-kick').setRequired(true))
    .addStringOption(opt => opt.setName('alasan').setDescription('Alasan kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user')
    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan'
    const member = await interaction.guild.members.fetch(target.id).catch(() => null)

    if (!member) return interaction.reply({ content: 'User gak ada di server.', ephemeral: true })
    if (!member.kickable) return interaction.reply({ content: 'Gak bisa kick user ini.', ephemeral: true })

    await target.send({ content: `Kamu di-kick dari **${interaction.guild.name}**.\nAlasan: ${reason}` }).catch(() => {})

    await member.kick(reason)
    const embed = new EmbedBuilder()
      .setColor(0xff4444)
      .setTitle('♢ Kicked')
      .setDescription(`**${target.tag}** telah di-kick.\nAlasan: ${reason}`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
