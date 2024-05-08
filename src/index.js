import { Client, IntentsBitField } from 'discord.js';
import eventHandler from './handlers/eventHandler.js';
import logger from './log.js';
import dotenv from 'dotenv';
import { initializeDb } from './dbinit.js';

dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

main();

async function main() {
  const { DISCORD_TOKEN, DISCORD_GUILD_ID } = process.env;

  if (!DISCORD_TOKEN || !DISCORD_GUILD_ID) {
    throw new Error("Missing environment variables");
  }

  logger.info("Environment: " + process.env.NODE_ENV);

  initializeDb(process.env.DB_NAME);

  const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ]
  });

  await eventHandler(client);

  client.login(process.env.DISCORD_TOKEN);
}