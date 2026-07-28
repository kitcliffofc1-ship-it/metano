const { SlashCommandBuilder } = require('discord.js')
const db = require('../../utils/supabase')
const { shop } = require('./shop')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Beli item dari shop')
    .addStringOption(opt =>
      opt.setName('item')
        .setDescription('Nama item (lihat di /shop)')
        .setRequired(true)
        .addChoices(...shop.map(item => ({ name: item.name, value: item.id })))
    ),

  async execute(interaction) {
    const itemId = interaction.options.getString('item')
    const item = shop.find(i => i.id === itemId)
    if (!item) return interaction.reply({ content: 'Item gak ditemukan.', ephemeral: true })

    const user = await db.getUser(interaction.user.id, interaction.guildId)
    if (user.balance < item.price) {
      return interaction.reply({
        content: `Saldo gak cukup. Butuh **$${item.price}**, punya **$${user.balance}**.`,
        ephemeral: true
      })
    }

    await db.updateUser(interaction.user.id, interaction.guildId, {
      balance: user.balance - item.price
    })

    await interaction.reply({ content: `Berhasil beli **${item.name}**!` })
  }
}
