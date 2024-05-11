import { Database } from 'sqlite3';
import { SlashCommandBuilder, PermissionFlagsBits, Client, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { SearchRepository } from '../persistance';
import { Command } from '../interfaces';

export default class QueriesCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('queries')
    .setDescription('List all queries')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON();

  async execute(client: Client, interaction: Interaction) {
    if (!(interaction instanceof ChatInputCommandInteraction))
      return;

    await interaction.deferReply({ ephemeral: true });

    let text: string;
    let dbConnection: Database | undefined;

    try {
      dbConnection = new Database(process.env.DB_NAME!);

      const searches = new SearchRepository(dbConnection);
      const data = await searches.listAll();

      text = data.map(item => `[${item.id}] ${item.name}`).join('\r\n');
    } finally {
      dbConnection?.close();
    }

    await interaction.editReply({ content: text ? text : 'No searches added yet.' });
  }
}