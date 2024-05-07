const { Client, IntentsBitField } = require('discord.js');
const eventHandler = require('./handlers/eventHandler')
const logger = require('./log');

require('dotenv').config();
require('./dbinit');

logger.info("Environment: " + process.env.NODE_ENV);

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
});

eventHandler(client);

client.login(process.env.TOKEN);