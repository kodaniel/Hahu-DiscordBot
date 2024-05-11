import { Database } from "sqlite3";
import { Search } from "../models/Search";
import { BaseRepository } from "./BaseRepository";

export class SearchRepository extends BaseRepository<Search> {
  constructor(db: Database) {
    super(db, 'searches');
  }

  public async getByName(name: string): Promise<Search | undefined> {
    return new Promise<Search>((resolve, reject) => {
      this.db.get('SELECT * FROM `searches` WHERE `name` = ?', name, (err, row) => {
        if (err)
          reject(err);
        else
          resolve(row as Search);
      });
    });
  }
}