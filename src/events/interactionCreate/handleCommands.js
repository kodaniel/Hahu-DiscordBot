const getLocalCommands = require('../../utils/getLocalCommands');

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
      console.log(`There was an error running this command: ${error}`);
    }
  },
};