const _ = require('lodash');
const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rm')
    .setDescription('Remove search')
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('Unique id of the query')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    const configPath = path.join(__dirname, '../../data/config.json');

    if (!fs.existsSync(configPath))
      return;

    let config = JSON.parse(fs.readFileSync(configPath));
    const id = interaction.options.get('id').value

    _.remove(config.searches, item => item.id === id);

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    await interaction.editReply({ content: `Watcher has been removed with the id '${id}'.`, ephemeral: true })
  }
}