import { Database } from "sqlite3";
import { Car } from "../models/Car";
import { BaseRepository } from "./BaseRepository";

export class CarRepository extends BaseRepository<Car> {
  constructor(db: Database) {
    super(db, 'cars');
  }

  public async listAllInSearch(searchId: number): Promise<Car[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM `' + this.dbTable + '` WHERE searchId = ?', searchId, (err, rows) => {
        if (err)
          reject(err);
        else
          resolve(rows as Car[]);
      });
    });
  }
}