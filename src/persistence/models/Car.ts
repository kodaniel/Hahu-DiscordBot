import { IEntity } from "./IEntity";

export class Car implements IEntity {
  id?: number;
  searchId?: number;
  title: string = '';
  description: string = '';
  image: string = '';
  link: string = '';
  extraData: string = '';
  properties: string = '';
  price: string = '';
  distance: string = '';
}