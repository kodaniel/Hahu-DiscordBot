export default class SearchRepository {

  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async get(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM `searches` WHERE `id` = ?', id, (err, row) => {
        if (err)
          reject(err);
        resolve(row);
      });
    });
  }

  async getByName(name) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM `searches` WHERE `name` = ?', name, (err, row) => {
        if (err)
          reject(err);
        resolve(row);
      });
    });
  }

  async listAll() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM `searches`', (err, rows) => {
        if (err)
          reject(err);
        resolve(rows);
      });
    });
  }

  async add(data) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO `searches` (name, url, location, channelId) VALUES ($name, $url, $location, $channelId)', {
        $name: data.name,
        $url: data.url,
        $location: data.location,
        $channelId: data.channelId
      }, (err) => {
        if (err)
          reject(err);
        resolve();
      });
    });
  }

  async update(id, data) {

  }

  async remove(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM `searches` WHERE `id` = ?', id, function (err) {
        if (err)
          reject(err);
        resolve(this.changes);
      });
    });
  }
};