import { areCommandsDifferent, getApplicationCommands, getLocalCommands } from '../../utils';
import { Client, Interaction } from 'discord.js';
import { Event } from '../../interfaces';
import logger from 'winston';

export default class RegisterCommands extends Event {
	protected _once: boolean = true;

	async execute(client: Client, interaction: Interaction) {
		try {
			const { DISCORD_GUILD_ID } = process.env;
			const localCommands = await getLocalCommands();
			const applicationCommands = await getApplicationCommands(client, DISCORD_GUILD_ID);

			for (const localCommand of localCommands) {
				const name = localCommand.data.name;
				const existingCommand = await applicationCommands.cache.find((cmd: any) => cmd.name === name);

				if (existingCommand) {
					if (localCommand.deleted) {
						await applicationCommands.delete(existingCommand.id);
						logger.info(`🗑 Deleted command "${name}".`);
						continue;
					}

					if (areCommandsDifferent(existingCommand, localCommand)) {
						await applicationCommands.edit(existingCommand.id, localCommand.data);

						logger.info(`🔁 Edited command "${name}".`);
					}
				} else {
					if (localCommand.deleted) {
						logger.info(`⏩ Skipping registering command "${name}" as it's set to delete.`);
						continue;
					}

					await applicationCommands.create(localCommand.data);

					logger.info(`👍 Registered command "${name}."`);
				}
			}
		} catch (error) {
			logger.error(`There was an error: ${error}`);
		}
	}
}