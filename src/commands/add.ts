import { Database } from 'sqlite3';
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, Client, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { Search, SearchRepository } from '../persistance';
import { Command } from '../interfaces';

export default class AddCommand extends Command {
  data = new SlashCommandBuilder()
    .setName('add')
    .setDescription('Add new search')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('Unique name of the query')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(20))
    .addStringOption(option =>
      option
        .setName('url')
        .setDescription('Query url')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('location')
        .setDescription('Set the location, copy the id from cookie'))
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Output channel')
        .addChannelTypes(ChannelType.GuildText))
    .toJSON();

  async execute(client: Client, interaction: Interaction) {
    if (!(interaction instanceof ChatInputCommandInteraction))
      return;

    await interaction.deferReply({ ephemeral: true });

    const searchData = new Search();
    searchData.name = interaction.options.get('id')!.value as string;
    searchData.url = interaction.options.get('url')!.value as string;
    searchData.location = interaction.options.get('location')?.value as number | undefined;
    searchData.channelId = (interaction.options.get('channel')?.value ?? interaction.channelId) as string

    let content: string;
    let dbConnection: Database | undefined;

    try {
      dbConnection = new Database(process.env.DB_NAME!);
      const searches = new SearchRepository(dbConnection);

      if (searchData.location && searchData.location < 0)
        throw 'Location id must be positive.';

      if (!/^https:\/\/www\.hasznaltauto\.hu\/talalatilista\/([a-zA-Z0-9])*/.test(searchData.url))
        throw 'Invalid url.';

      if (await searches.getByName(searchData.name))
        throw 'Name already exists.';

      searchData.location = 0;
      await searches.add(searchData);

      content = `Watcher has been added with the name '${searchData.name}'.`;
    } catch (err) {
      content = `Failed to add the watcher: ${err}`;
    } finally {
      dbConnection?.close();
    }

    await interaction.editReply({ content });
  }
}