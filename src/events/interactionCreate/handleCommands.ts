import { Client, Interaction } from 'discord.js';
import { getLocalCommands } from '../../utils';
import logger from 'winston';
import { Event } from '../../interfaces';

export default class HandleCommands extends Event {
  async execute(client: Client, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = await getLocalCommands();

    try {
      const commandObject = localCommands.find(
        (cmd) => cmd.data.name === interaction.commandName
      );

      if (!commandObject) return;

      await commandObject.execute(client, interaction);
    } catch (error) {
      logger.error(`There was an error running this command: ${error}`);
    }
  }
};