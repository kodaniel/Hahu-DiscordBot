import path from 'path';
import { getAllFiles } from '../utils';
import logger from 'winston';
import { Client } from 'discord.js';
import { Event } from '../interfaces/Event';

export default async (client: Client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a.localeCompare(b));

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop() as string;
    for (const eventFile of eventFiles) {
      const event = (await import(eventFile))?.default;
      const eventObj: Event = new event();

      if (eventObj.disabled)
        continue;

      if (eventObj.once) {
        client.once(eventName, async (args) => await eventObj.execute(client, args));
      } else {
        client.on(eventName, async (args) => await eventObj.execute(client, args));
      }

      logger.info(`👍 Event listener has been added: ${path.basename(eventFile)}`);
    }
  }
}