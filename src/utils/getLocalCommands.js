const path = require('path');
const _ = require('lodash');
const getAllFiles = require('./getAllFiles');

module.exports = (exceptions = []) => {
  let localCommands = [];

  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = getAllFiles(commandsPath);

  for (const commandFile of commandFiles) {
    const commandObject = require(commandFile);

    if (_.isEmpty(commandObject)) {
      continue;
    }

    if (exceptions.includes(commandObject.data.name)) {
      continue;
    }

    localCommands.push(commandObject);
  }
  
  return localCommands;
}
