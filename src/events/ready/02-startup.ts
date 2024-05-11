import { Client, Interaction } from 'discord.js';
import { HahuService } from '../../services';
import { Event } from '../../interfaces';
import logger from 'winston';

export default class OnStartUp extends Event {
	protected _once: boolean = true;

	async execute(client: Client, interaction: Interaction) {
		logger.info(`🤖 ${client.user!.tag} bot is ready.`);

		await new HahuService(client).start();
	}
};