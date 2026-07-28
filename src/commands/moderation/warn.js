const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn member')
    .addUserOption(opt => opt.setName('user').setDescription('User yang mau di-warn').setRequired(true))
    .addStringOption(opt => opt.setName('alasan').setDescription('Alasan warn'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user')
    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan'

    const guild = await db.getGuild(interaction.guildId)
    const warns = (guild.warns || {})[target.id] || []
    warns.push({ reason, moderator: interaction.user.id, date: new Date().toISOString() })

    await db.updateGuild(interaction.guildId, {
      warns: { ...(guild.warns || {}), [target.id]: warns }
    })

    await target.send({ content: `Kamu kena warn di **${interaction.guild.name}**.\nAlasan: ${reason}\nTotal warn: ${warns.length}` }).catch(() => {})

    const embed = new EmbedBuilder()
      .setColor(0xffaa00)
      .setTitle('♢ Warn')
      .setDescription(`**${target.tag}** kena warn!\nAlasan: ${reason}\nTotal warn: ${warns.length}`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
