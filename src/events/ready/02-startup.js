const Service = require('../../services/service')

module.exports = {
	once: true,
	async execute(client) {
		console.log(`${client.user.tag} is online.`);

		new Service(client).start();
	},
};