import { Client, IntentsBitField, ClientOptions } from 'discord.js';
import { IDiscordClient } from './interfaces';
import { initializeDb } from './dbinit';
import logger from './log'
import EventHandler from './handlers/eventHandler';

const options: ClientOptions = {
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
};

export default class DiscordClient extends Client implements IDiscordClient {
  constructor() {
    super(options);
  }

  async start() {
    const { NODE_ENV, DISCORD_TOKEN, DISCORD_GUILD_ID, DB_NAME } = process.env;

    logger.info('Environment: ' + NODE_ENV);

    if (!DISCORD_TOKEN || !DISCORD_GUILD_ID) {
      throw 'Missing environment variables';
    }

    if (!DB_NAME) {
      throw 'Database name is missing';
    }

    await initializeDb(DB_NAME);

    await this.registerEvents();

    await this.login(DISCORD_TOKEN);
  }

  private async registerEvents() {
    logger.info("Registering events...");
    await EventHandler(this);
  }
}