const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlevelrole')
    .setDescription('Set role reward buat level tertentu')
    .addIntegerOption(opt => opt.setName('level').setDescription('Level').setRequired(true).setMinValue(1))
    .addRoleOption(opt => opt.setName('role').setDescription('Role yang dikasih').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const level = interaction.options.getInteger('level')
    const role = interaction.options.getRole('role')

    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({ content: '♢ Role itu lebih tinggi dari role bot. Gak bisa.', ephemeral: true })
    }

    const guild = await db.getGuild(interaction.guildId)
    const roles = (guild.level_roles && typeof guild.level_roles === 'string'
      ? JSON.parse(guild.level_roles) : {}) || {}
    roles[level] = role.id

    await db.updateGuild(interaction.guildId, { level_roles: JSON.stringify(roles) })
    await interaction.reply({ content: `★ Level **${level}** → ${role}`, ephemeral: true })
  }
}
