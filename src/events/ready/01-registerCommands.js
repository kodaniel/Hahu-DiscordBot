const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');

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
						console.log(`🗑 Deleted command "${name}".`);
						continue;
					}

					if (areCommandsDifferent(existingCommand, localCommand)) {
						await applicationCommands.edit(existingCommand.id, localCommand);

						console.log(`🔁 Edited command "${name}".`);
					}
				} else {
					if (localCommand.deleted) {
						console.log(
							`⏩ Skipping registering command "${name}" as it's set to delete.`
						);
						continue;
					}

					await applicationCommands.create(localCommand);

					console.log(`👍 Registered command "${name}."`);
				}
			}
		} catch (error) {
			console.log(`There was an error: ${error}`);
		}
	},
}