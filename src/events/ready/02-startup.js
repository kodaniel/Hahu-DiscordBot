import { HahuService } from '../../services/index.js';
import logger from 'winston';

export default {
	once: true,
	//disabled: true,
	async execute(client) {
		logger.info(`🤖 ${client.user.tag} bot is ready.`);

		new HahuService(client).start();
	},
};