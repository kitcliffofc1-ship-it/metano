const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Klaim reward harian kamu'),

  async execute(interaction) {
    const user = await db.getUser(interaction.user.id, interaction.guildId)

    const cooldown = 24 * 60 * 60 * 1000
    const lastDaily = new Date(user.last_daily || 0).getTime()
    const now = Date.now()

    if (now - lastDaily < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastDaily)) / 3600000)
      return interaction.reply({
        content: `Kamu udah klaim hari ini. Coba lagi **${remaining} jam** lagi.`,
        ephemeral: true
      })
    }

    const streak = user.daily_streak + 1
    const base = 100
    const bonus = Math.min(streak * 10, 100)
    const reward = base + bonus

    await db.updateUser(interaction.user.id, interaction.guildId, {
      balance: user.balance + reward,
      daily_streak: streak,
      last_daily: new Date().toISOString()
    })

    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle('Daily Reward')
      .setDescription(`Kamu dapet **$${reward}**! Streak: **${streak}** hari ${bonus > 0 ? `(+$${bonus} bonus)` : ''}`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
