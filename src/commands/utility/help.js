const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const config = require('../../config')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Daftar semua command'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(config.embedColor)
      .setTitle(`${config.botName} — Help`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        {
          name: '$ Economy',
          value: '`/balance` `/work` `/daily` `/shop` `/buy` `/transfer`',
          inline: true
        },
        {
          name: '⚔ Moderation',
          value: '`/kick` `/ban` `/unban` `/warn` `/warnings` `/timeout` `/purge`',
          inline: true
        },
        {
          name: '≡ Leveling',
          value: '`/rank` `/leaderboard`',
          inline: true
        },
        {
          name: '⚙ Utility',
          value: '`/ping` `/userinfo` `/serverinfo` `/help`',
          inline: true
        },
      )
      .setFooter({ text: `${config.botName} — calm but strict` })

    await interaction.reply({ embeds: [embed] })
  }
}
