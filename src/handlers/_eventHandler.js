import path from 'path';
import _ from 'lodash';
import { fileURLToPath, pathToFileURL } from 'url';
import { getAllFiles } from '#utils';
import logger from 'winston';

export default async (client) => {
  let __dirname = path.dirname(fileURLToPath(import.meta.url));
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b);

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
    for (const eventFile of eventFiles) {
      const { default: event } = await import(pathToFileURL(eventFile));

      if (_.isEmpty(event) || event.disabled)
        continue;

      if (event.once) {
        client.once(eventName, async (args) => await event.execute(client, args));
      } else {
        client.on(eventName, async (args) => await event.execute(client, args));
      }

      logger.info(`👍 Event listener has been added: ${path.basename(eventFile)}`);
    }
  }
}