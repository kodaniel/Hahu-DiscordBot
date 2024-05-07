const { areCommandsDifferent, getApplicationCommands, getLocalCommands } = require('../../utils');
const logger = require('winston');

module.exports = {
	once: true,
	async execute(client) {
		try {
			const localCommands = getLocalCommands();
			const applicationCommands = await getApplicationCommands(
				client,
				process.env.GUILD_ID
			);

			for (const localCommand of localCommands) {
				const name = localCommand.data.name;
				const existingCommand = await applicationCommands.cache.find(
					(cmd) => cmd.name === name
				);

				if (existingCommand) {
					if (localCommand.deleted) {
						await applicationCommands.delete(existingCommand.id);
						logger.info(`🗑 Deleted command "${name}".`);
						continue;
					}

					if (areCommandsDifferent(existingCommand, localCommand)) {
						await applicationCommands.edit(existingCommand.id, localCommand.data.toJSON());

						logger.info(`🔁 Edited command "${name}".`);
					}
				} else {
					if (localCommand.deleted) {
						logger.info(`⏩ Skipping registering command "${name}" as it's set to delete.`);
						continue;
					}

					await applicationCommands.create(localCommand.data.toJSON());

					logger.info(`👍 Registered command "${name}."`);
				}
			}
		} catch (error) {
			logger.error(`There was an error: ${error}`);
		}
	},
}