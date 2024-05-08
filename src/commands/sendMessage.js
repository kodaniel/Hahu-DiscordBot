import { SlashCommandBuilder, ChannelType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('anyád')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Output channel')
        .addChannelTypes(ChannelType.GuildText)),

  async execute(client, interaction) {
    await interaction.deferReply();

    const channel = interaction.options.get('channel')?.value ?? interaction.channelId;
    await client.channels.cache.get(channel).send('Helló');

    await interaction.editReply('Done ' + client.channels.cache.get(channel).name);
  }
}