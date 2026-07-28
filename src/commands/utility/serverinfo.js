const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Info tentang server ini'),

  async execute(interaction) {
    const guild = interaction.guild
    await guild.members.fetch()

    const embed = new EmbedBuilder()
      .setColor(0x808040)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: 'Owner', value: (await guild.fetchOwner()).user.tag, inline: true },
        { name: 'Members', value: guild.memberCount.toString(), inline: true },
        { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Created', value: guild.createdAt.toDateString(), inline: true },
        { name: 'ID', value: guild.id, inline: true }
      )
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
