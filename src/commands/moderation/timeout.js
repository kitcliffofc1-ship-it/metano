const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout/mute member sementara')
    .addUserOption(opt => opt.setName('user').setDescription('User yang mau di-timeout').setRequired(true))
    .addIntegerOption(opt =>
      opt.setName('menit')
        .setDescription('Durasi dalam menit (max 40320)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(opt => opt.setName('alasan').setDescription('Alasan timeout'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user')
    const minutes = interaction.options.getInteger('menit')
    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan'
    const member = await interaction.guild.members.fetch(target.id).catch(() => null)

    if (!member) return interaction.reply({ content: 'User gak ada di server.', ephemeral: true })
    if (!member.moderatable) return interaction.reply({ content: 'Gak bisa timeout user ini.', ephemeral: true })

    await target.send({ content: `Kamu di-timeout **${minutes} menit** di **${interaction.guild.name}**.\nAlasan: ${reason}` }).catch(() => {})

    await member.timeout(minutes * 60 * 1000, reason)

    const embed = new EmbedBuilder()
      .setColor(0xffaa00)
      .setTitle('♢ Timeout')
      .setDescription(`**${target.tag}** di-timeout selama **${minutes} menit**.\nAlasan: ${reason}`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
