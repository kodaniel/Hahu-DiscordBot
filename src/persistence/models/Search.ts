import { IEntity } from "./IEntity";

export class Search implements IEntity {
  id?: number;
  name: string = '';
  url: string = '';
  location?: number;
  channelId?: string;
}