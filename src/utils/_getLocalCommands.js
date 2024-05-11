import path from 'path';
import _ from 'lodash';
import { fileURLToPath, pathToFileURL } from 'url';
import getAllFiles from './getAllFiles.js';

export default async (exceptions = []) => {
  let localCommands = [];

  let __dirname = path.dirname(fileURLToPath(import.meta.url));
  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = getAllFiles(commandsPath);

  for (const commandFile of commandFiles) {
    const { default: commandObject } = await import(pathToFileURL(commandFile));

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
