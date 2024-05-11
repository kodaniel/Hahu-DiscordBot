import { IEntity } from "./IEntity";

export class Car implements IEntity {
  id: number = 0;
  searchId: number = 0;
  title: string = '';
  description: string = '';
  image: string = '';
  link: string = '';
  extraData: string = '';
  properties: string = '';
  price: string = '';
  distance: string = '';
}