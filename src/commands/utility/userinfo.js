const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Info tentang user')
    .addUserOption(opt => opt.setName('user').setDescription('User yang dicek')),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user
    const member = await interaction.guild.members.fetch(target.id)

    const embed = new EmbedBuilder()
      .setColor(0x808040)
      .setTitle(`Info ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: 'Username', value: target.tag, inline: true },
        { name: 'ID', value: target.id, inline: true },
        { name: 'Joined', value: member.joinedAt?.toDateString() || 'Unknown', inline: true },
        { name: 'Roles', value: member.roles.cache.map(r => r.name).join(', ') || 'None' }
      )
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
