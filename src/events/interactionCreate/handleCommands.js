const { getLocalCommands } = require('../../utils');
const logger = require('winston');

module.exports = {
  async execute(client, interaction) {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();

    try {
      const commandObject = localCommands.find(
        (cmd) => cmd.data.name === interaction.commandName
      );

      if (!commandObject) return;

      await commandObject.execute(client, interaction);
    } catch (error) {
      logger.error(`There was an error running this command: ${error}`);
    }
  },
};