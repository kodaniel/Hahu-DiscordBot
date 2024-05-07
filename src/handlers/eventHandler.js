const path = require('path');
const _ = require('lodash');
const { getAllFiles } = require('../utils');
const logger = require('winston');

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b);

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
    for (const eventFile of eventFiles) {
      const event = require(eventFile);

      if (_.isEmpty(event) || event.disabled)
        continue;

      if (event.once) {
        client.once(eventName, async (args) => await event.execute(client, args));
      } else {
        client.on(eventName, async (args) => await event.execute(client, args));
      }

      logger.info(`[EVENT] Event listener has been added: ${path.basename(eventFile)}`);
    }
  }
}