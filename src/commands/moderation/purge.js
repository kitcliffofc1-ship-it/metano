const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Hapus pesan massal (max 100)')
    .addIntegerOption(opt =>
      opt.setName('jumlah')
        .setDescription('Jumlah pesan yang dihapus (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger('jumlah')
    const messages = await interaction.channel.bulkDelete(amount, true)
    const reply = await interaction.reply({
      content: `☄ Berhasil hapus **${messages.size}** pesan.`,
      ephemeral: true
    })
  }
}
