const fs = require('node:fs');
const path = require('node:path');
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

function upsert(array, element, predicate) {
  const i = array.findIndex(e => predicate(e) === predicate(element));
  if (i > -1) array[i] = element;
  else array.push(element);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add new search')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('Unique id of the query')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(20))
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('Query url')
        .setRequired(true))
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Output channel')
        .addChannelTypes(ChannelType.GuildText)),

  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    const configPath = path.join(__dirname, '../../data/config.json');

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath));
    } else {
      config.searches = [];
    }

    const data = {
      id: interaction.options.get('id').value,
      url: interaction.options.get('url').value,
      channel: interaction.options.get('channel')?.value
    };

    upsert(config.searches, data, d => d.id);

    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

    await interaction.editReply({ content: `Watcher has been added with the id '${data.id}'.`, ephemeral: true });
  }
}