const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const db = require('../../utils/supabase')

const jobs = [
  { name: 'Programmer', pay: [50, 200] },
  { name: 'Petani', pay: [30, 150] },
  { name: 'Koki', pay: [40, 180] },
  { name: 'Driver', pay: [20, 120] },
  { name: 'Builder', pay: [60, 250] }
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Kerja buat dapet uang'),

  async execute(interaction) {
    const user = await db.getUser(interaction.user.id, interaction.guildId)

    const cooldown = 5 * 60 * 1000
    const lastWork = new Date(user.last_work || 0).getTime()
    const now = Date.now()

    if (now - lastWork < cooldown) {
      const remaining = Math.ceil((cooldown - (now - lastWork)) / 1000)
      return interaction.reply({
        content: `Kamu capek. Istirahat dulu **${remaining} detik** lagi.`,
        ephemeral: true
      })
    }

    const job = jobs[Math.floor(Math.random() * jobs.length)]
    const pay = Math.floor(Math.random() * (job.pay[1] - job.pay[0] + 1)) + job.pay[0]

    await db.updateUser(interaction.user.id, interaction.guildId, {
      balance: user.balance + pay,
      last_work: new Date().toISOString()
    })

    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle('Kerja')
      .setDescription(`Kamu kerja sebagai **${job.name}** dan dapat **$${pay}**!`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
