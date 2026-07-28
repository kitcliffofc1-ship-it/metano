const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const db = require('../../utils/supabase')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('Transfer uang ke user lain')
    .addUserOption(opt => opt.setName('user').setDescription('Penerima').setRequired(true))
    .addIntegerOption(opt => opt.setName('jumlah').setDescription('Jumlah uang').setRequired(true).setMinValue(1)),

  async execute(interaction) {
    const target = interaction.options.getUser('user')
    const amount = interaction.options.getInteger('jumlah')

    if (target.id === interaction.user.id) {
      return interaction.reply({ content: 'Gabisa transfer ke diri sendiri.', ephemeral: true })
    }
    if (target.bot) {
      return interaction.reply({ content: 'Gabisa transfer ke bot.', ephemeral: true })
    }

    const sender = await db.getUser(interaction.user.id, interaction.guildId)
    if (sender.balance < amount) {
      return interaction.reply({ content: `Saldo kamu kurang. Butuh **$${amount}**, kamu cuma punya **$${sender.balance}**.`, ephemeral: true })
    }

    const receiver = await db.getUser(target.id, interaction.guildId)
    await db.updateUser(interaction.user.id, interaction.guildId, { balance: sender.balance - amount })
    await db.updateUser(target.id, interaction.guildId, { balance: receiver.balance + amount })

    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle('Transfer')
      .setDescription(`Berhasil transfer **$${amount}** ke **${target.username}**!`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}
