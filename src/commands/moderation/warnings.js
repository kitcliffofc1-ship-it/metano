const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Lihat warn user')
    .addUserOption(opt => opt.setName('user').setDescription('User yang dicek').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user')
    const guild = await db.getGuild(interaction.guildId)
    const warns = (guild.warns || {})[target.id]

    if (!warns || warns.length === 0) {
      return interaction.reply({ content: `${target.tag} bersih, gak ada warn.` })
    }

    const lines = warns.map((w, i) =>
      `**${i + 1}.** ${w.reason} — <@${w.moderator}> (${new Date(w.date).toLocaleDateString()})`
    )

    const embed = new EmbedBuilder()
      .setColor(0xffaa00)
      .setTitle(`Warnings — ${target.username}`)
      .setDescription(lines.join('\n'))
      .setFooter({ text: `Total: ${warns.length} warn` })

    await interaction.reply({ embeds: [embed] })
  }
}
