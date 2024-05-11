import { Database } from "sqlite3";
import { IEntity } from "../models/IEntity";

export abstract class BaseRepository<TEntity extends IEntity> {

  protected db: Database;
  protected dbTable: string;

  constructor(dbConnection: Database, dbTable: string) {
    this.db = dbConnection;
    this.dbTable = dbTable;
  }

  public close() {
    this.db.close();
  }

  public async get(id: number): Promise<TEntity | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM `' + this.dbTable + '` WHERE `id` = ?', id, (err, row) => {
        if (err)
          reject(err);
        resolve(row as TEntity);
      });
    });
  }

  public async listAll(): Promise<TEntity[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM `' + this.dbTable + '`', (err, rows) => {
        if (err)
          reject(err);
        resolve(rows as TEntity[]);
      });
    });
  }

  public async add(data: TEntity): Promise<number> {
    return new Promise((resolve, reject) => {
      let columns = Object.keys(data).join(', ');
      let values = Object.values(data);

      this.db.run('INSERT INTO `' + this.dbTable + '` (' + columns + ') VALUES (' + '? '.repeat(columns.length) + ')',
        values,
        function (err) {
          if (err)
            reject(err);
          resolve(this.lastID);
        });
    });
  }

  public async update(id: number, data: TEntity): Promise<number> {
    return new Promise((resolve, reject) => {
      let columns = Object.keys(data).map(c => `${c} = $${c}`).join(', ');
      let obj = Object.keys(data).reduce<any>((acc, key) => ({
        ...acc,
        ['$' + key]: data[key]
      }), {});
      obj['$id'] = id;

      this.db.run('UPDATE `' + this.dbTable + '` SET ' + columns + ' WHERE id = $id', obj, function (err) {
        if (err)
          reject(err);
        resolve(this.changes);
      });
    });
  }

  public async remove(id: number): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM `' + this.dbTable + '` WHERE `id` = ?', id, function (err) {
        if (err)
          reject(err);
        resolve(this.changes);
      });
    });
  }
}