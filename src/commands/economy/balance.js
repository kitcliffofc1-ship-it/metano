const { SlashCommandBuilder } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Cek saldo kamu atau user lain')
    .addUserOption(opt => opt.setName('user').setDescription('User yang mau dicek')),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user
    const data = await db.getUser(target.id, interaction.guildId)

    await interaction.reply({
      content: `${target.id === interaction.user.id ? 'Saldo kamu' : `Saldo **${target.username}**`}: **$${data.balance.toLocaleString()}**`
    })
  }
}
