const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban member dari server')
    .addUserOption(opt => opt.setName('user').setDescription('User yang mau di-ban').setRequired(true))
    .addStringOption(opt => opt.setName('alasan').setDescription('Alasan ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user')
    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan'
    const member = await interaction.guild.members.fetch(target.id).catch(() => null)

    if (!member) return interaction.reply({ content: 'User gak ada di server.', ephemeral: true })
    if (!member.bannable) return interaction.reply({ content: 'Gak bisa ban user ini.', ephemeral: true })

    await target.send({ content: `Kamu di-ban dari **${interaction.guild.name}**.\nAlasan: ${reason}` }).catch(() => {})

    await member.ban({ reason })
    const embed = new EmbedBuilder()
      .setColor(0xff4444)
      .setTitle('♢ Banned')
      .setDescription(`**${target.tag}** telah di-ban.\nAlasan: ${reason}`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
