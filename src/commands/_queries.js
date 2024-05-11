import sqlite3 from 'sqlite3';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { SearchRepository } from '../repositories/index.js';

export default {
  data: new SlashCommandBuilder()
    .setName('queries')
    .setDescription('List all queries')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    let text;
    let dbConnection;

    try {
      dbConnection = new sqlite3.Database(process.env.DB_NAME);
      
      const searches = new SearchRepository(dbConnection);
      const data = await searches.listAll();

      text = data.map(item => `[${item.id}] ${item.name}`).join('\r\n');
    } finally {
      dbConnection.close();
    }

    await interaction.editReply({ content: text ? text : 'No searches added yet.', ephemeral: true });
  }
}