const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const db = require('../../utils/supabase')

function getXpForLevel(level) {
  return 5 * (level ** 2) + 50 * level + 100
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Cek level kamu atau user lain')
    .addUserOption(opt => opt.setName('user').setDescription('User yang dicek')),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user
    const data = await db.getUser(target.id, interaction.guildId)

    const currentXp = data.xp
    const currentLevel = data.level
    const xpForNext = getXpForLevel(currentLevel)
    const xpForCurrent = getXpForLevel(currentLevel - 1)
    const xpInLevel = currentXp - xpForCurrent
    const xpNeeded = xpForNext - xpForCurrent
    const progress = Math.min(Math.floor((xpInLevel / xpNeeded) * 10), 10)

    const bar = '█'.repeat(progress) + '░'.repeat(10 - progress)

    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle(`${target.username} — Level ${currentLevel}`)
      .setDescription(`**XP:** ${currentXp} / ${xpForNext}\n${bar}`)
      .setFooter({ text: 'Metano' })

    await interaction.reply({ embeds: [embed] })
  }
}

module.exports.getXpForLevel = getXpForLevel
