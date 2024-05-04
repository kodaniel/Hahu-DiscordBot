const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queries')
    .setDescription('List all queries')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    const configPath = path.join(__dirname, '../../data/config.json');

    if (!fs.existsSync(configPath))
      return;

    let config = JSON.parse(fs.readFileSync(configPath));
    let text = config.searches.map((item, i) => `${i + 1}. ${item.id} <${item.url}>`).join('\r\n');
    
    await interaction.editReply({ content: text, ephemeral: true });
  }
}