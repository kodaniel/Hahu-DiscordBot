import { getLocalCommands } from '../../utils/index.js';
import logger from 'winston';

export default {
  async execute(client, interaction) {
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