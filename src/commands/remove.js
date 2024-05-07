const sqlite3 = require('sqlite3').verbose();
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { SearchRepository } = require('../repositories');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rm')
    .setDescription('Remove search')
    .addIntegerOption(option =>
      option
        .setName('id')
        .setDescription('Id of the query')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const id = interaction.options.get('id').value

    let result;
    let dbConnection;

    try {
      dbConnection = new sqlite3.Database(process.env.DB_NAME);

      const searches = new SearchRepository(dbConnection);
      result = await searches.remove(id);
    } finally {
      dbConnection.close();
    }

    await interaction.editReply({ content: result ? `Watcher has been removed with id ${id}.` : 'No record found with this id.', ephemeral: true })
  }
}