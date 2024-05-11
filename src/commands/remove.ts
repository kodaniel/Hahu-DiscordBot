import { Database } from 'sqlite3';
import { SlashCommandBuilder, PermissionFlagsBits, Client, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { SearchRepository } from '../persistence';
import { Command } from '../interfaces';

export default class RemoveCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('rm')
    .setDescription('Remove search')
    .addIntegerOption(option =>
      option
        .setName('id')
        .setDescription('Id of the query')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON();

  async execute(client: Client, interaction: Interaction) {
    if (!(interaction instanceof ChatInputCommandInteraction))
      return;

    await interaction.deferReply({ ephemeral: true });

    const id = interaction.options.get('id')!.value as number;

    let result: number;
    let dbConnection: Database | undefined;

    try {
      dbConnection = new Database(process.env.DB_NAME!);

      const searches = new SearchRepository(dbConnection);
      result = await searches.remove(id);
    } finally {
      dbConnection?.close();
    }

    await interaction.editReply({ content: result ? `Watcher has been removed with id ${id}.` : 'No record found with this id.' })
  }
}