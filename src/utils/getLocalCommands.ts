import path from 'path';
import getAllFiles from './getAllFiles';
import { Command } from '../interfaces';

export default async (exceptions: string[] = []): Promise<Command[]> => {
  let localCommands: Command[] = [];

  const commandsPath = path.join(__dirname, '..', 'commands');
  const commandFiles = getAllFiles(commandsPath);

  for (const commandFile of commandFiles) {
    const command = (await import(commandFile))?.default;
    const commandObj: Command = new command();

    if (commandObj == null) {
      continue;
    }

    if (exceptions.includes(commandObj.data.name)) {
      continue;
    }

    localCommands.push(commandObj);
  }

  return localCommands;
}
