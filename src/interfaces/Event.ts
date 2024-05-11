import { Client, Interaction } from "discord.js";

export abstract class Event {
  protected readonly _disabled: boolean = false;
  protected readonly _once: boolean = false;

  public get disabled() {
    return this._disabled;
  }

  public get once() {
    return this._once;
  }
  
  public abstract execute(client: Client, interaction: Interaction) : Promise<void>;
}