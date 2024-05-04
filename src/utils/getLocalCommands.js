const path = require('path');
const fs = require('fs');
const getAllFiles = require('./getAllFiles');

module.exports = (exceptions = []) => {
  let localCommands = [];

  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = getAllFiles(commandsPath);

  for (const commandFile of commandFiles) {
    const commandObject = require(commandFile);

    if (exceptions.includes(commandObject.data.name)) {
      continue;
    }

    localCommands.push(commandObject);
  }
  
  return localCommands;
}
