import sqlite3 from 'sqlite3';
import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { SearchRepository } from '../repositories/index.js';

export default {
  data: new SlashCommandBuilder()
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
        .addChannelTypes(ChannelType.GuildText)),

  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    let t = interaction.options.get('channel');
    const data = {
      name: interaction.options.get('id').value,
      url: interaction.options.get('url').value,
      location: interaction.options.get('location')?.value,
      channelId: interaction.options.get('channel')?.value ?? interaction.channelId
    };

    let content;
    let dbConnection;
    
    try {
      dbConnection = new sqlite3.Database(process.env.DB_NAME);
      const searches = new SearchRepository(dbConnection);

      if (data.location && data.location < 0)
        throw 'Location id must be positive.';

      if (!/^https:\/\/www\.hasznaltauto\.hu\/talalatilista\/([a-zA-Z0-9])*/.test(data.url))
        throw 'Invalid url.';

      if (await searches.getByName(data.name))
        throw 'Name already exists.';

      await searches.add(data);

      content = `Watcher has been added with the name '${data.name}'.`;
    } catch (err) {
      content = `Failed to add the watcher: ${err}`;
    } finally {
      dbConnection.close();
    }

    await interaction.editReply({ content, ephemeral: true });
  }
}