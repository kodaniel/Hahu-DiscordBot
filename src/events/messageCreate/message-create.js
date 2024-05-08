import { EmbedBuilder } from 'discord.js';

export default {
  disabled: true,
	async execute(client) {
		if (client.author.bot) {
      return;
    }
  
    if (client.content === 'hello') {
      const embed = new EmbedBuilder()
        .setTitle('Autó neve')
        .setDescription('Autó leírása')
        .setURL('https://www.hasznaltauto.hu/');
  
        client.channel.send({ embeds: [embed] });
    }
	},
};