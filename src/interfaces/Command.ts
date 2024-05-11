import { RESTPostAPIChatInputApplicationCommandsJSONBody, Client, Interaction } from "discord.js";

export abstract class Command {
  public abstract data: RESTPostAPIChatInputApplicationCommandsJSONBody;
  public deleted: boolean = false;

  public abstract execute(client: Client, interaction: Interaction): Promise<void>;
}