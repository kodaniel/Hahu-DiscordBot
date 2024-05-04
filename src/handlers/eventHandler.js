const path = require('path');
const fs = require('fs');
const getAllFiles = require('../utils/getAllFiles');

module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort((a, b) => a > b);

    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
    for (const eventFile of eventFiles) {
      const event = require(eventFile);

      if (event.disabled)
        continue;

      if (event.once) {
        client.once(eventName, async (args) => await event.execute(client, args));
      } else {
        client.on(eventName, async (args) => await event.execute(client, args));
      }

      console.log(`[EVENT] Event listener has been added: ${path.basename(eventFile)}`);
    }
  }
}