const Service = require('../../services/service')
const logger = require('winston');

module.exports = {
	once: true,
	//disabled: true,
	async execute(client) {
		logger.info(`${client.user.tag} is online.`);

		new Service(client).start();
	},
};