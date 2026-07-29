const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('levelroles')
    .setDescription('Lihat daftar role reward per level'),

  async execute(interaction) {
    const guild = await db.getGuild(interaction.guildId)
    const roles = (guild.level_roles && typeof guild.level_roles === 'string'
      ? JSON.parse(guild.level_roles) : {}) || {}

    if (Object.keys(roles).length === 0) {
      return interaction.reply({ content: '♢ Belum ada level role reward.' })
    }

    const lines = Object.entries(roles)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([level, roleId]) => `Level **${level}** → <@&${roleId}>`)

    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle('★ Level Role Rewards')
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'Gunakan /setlevelrole buat nambah' })

    await interaction.reply({ embeds: [embed] })
  }
}
