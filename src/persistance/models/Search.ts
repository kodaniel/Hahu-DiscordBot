import { IEntity } from "./IEntity";

export class Search implements IEntity {
  id: number = 0;
  name: string = '';
  url: string = '';
  location?: number;
  channelId: string = '';
}