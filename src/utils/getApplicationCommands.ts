import { ApplicationCommandManager, Client, GuildApplicationCommandManager } from "discord.js";

export default async (client: Client, guildId: string | undefined): Promise<GuildApplicationCommandManager | ApplicationCommandManager> => {
  let applicationCommands: GuildApplicationCommandManager | ApplicationCommandManager;

  if (guildId) {
    const guild = await client.guilds.fetch(guildId);
    applicationCommands = guild.commands;
  } else {
    applicationCommands = await client.application!.commands;
  }

  await applicationCommands.fetch({});
  return applicationCommands;
}