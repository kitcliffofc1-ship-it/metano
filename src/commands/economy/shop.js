const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const shop = [
  { id: 'role_booster', name: 'Role Booster', price: 5000, desc: 'Dapetin per peran booster' },
  { id: 'nickname_pass', name: 'Nickname Pass', price: 2000, desc: 'Ganti nickname 1x' },
  { id: 'lottery_ticket', name: 'Lottery Ticket', price: 500, desc: 'Ikutan lotre mingguan' }
]

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Lihat item yang tersedia di shop'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle('Shop — Metano')
      .setDescription(shop.map((item, i) =>
        `**${i + 1}. ${item.name}** — $${item.price}\n└ ${item.desc}\n\`/buy ${item.id}\``
      ).join('\n'))
      .setFooter({ text: 'Gunakan /buy <id> untuk membeli' })

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('shop_dismiss')
        .setLabel('✕ Tutup')
        .setStyle(ButtonStyle.Secondary)
    )

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true })
  }
}

module.exports.shop = shop
