const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Top leaderboard')
    .addStringOption(opt =>
      opt.setName('tipe')
        .setDescription('Tipe leaderboard')
        .setRequired(true)
        .addChoices(
          { name: '$ Economy', value: 'economy' },
          { name: '≡ Level', value: 'level' }
        )
    ),

  async execute(interaction) {
    const type = interaction.options.getString('tipe')
    const isEconomy = type === 'economy'

    const data = isEconomy
      ? await db.getTopBalance(interaction.guildId, 10)
      : await db.getTopLevel(interaction.guildId, 10)

    if (!data || data.length === 0) {
      return interaction.reply({ content: 'Belum ada data.' })
    }

    const lines = await Promise.all(data.map(async (user, i) => {
      const member = await interaction.guild.members.fetch(user.user_id).catch(() => null)
      const name = member?.user?.username || 'Unknown'
      const val = isEconomy ? `$${user.balance.toLocaleString()}` : `Level ${user.level} (${user.xp} XP)`
      return `**${i + 1}.** ${name} — ${val}`
    }))

    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle(`♛ ${isEconomy ? 'Economy' : 'Level'} Leaderboard`)
      .setDescription(lines.join('\n'))
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
