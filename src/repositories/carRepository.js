module.exports = class CarRepository {

  constructor(dbConnection) {
    this.db = dbConnection;
  }

  close() {
    this.db.close();
  }

  async get(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM `cars` WHERE `id` = ?', id, (err, row) => {
        if (err)
          reject(err);
        resolve(row);
      });
    });
  }

  async listAll() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM `cars`', (err, rows) => {
        if (err)
          reject(err);
        resolve(rows);
      });
    });
  }

  async listAllInSearch(searchId) {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM `cars` WHERE searchId = ?', searchId, (err, rows) => {
        if (err)
          reject(err);
        resolve(rows);
      });
    });
  }

  async add(data) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO `cars` \
        (id, searchId, title, description, image, link, price, distance, extraData, properties) VALUES \
        ($id, $searchId, $title, $description, $image, $link, $price, $distance, $extraData, $properties)',
        {
          $id: data.id,
          $searchId: data.searchId,
          $title: data.title,
          $description: data.description,
          $image: data.image,
          $link: data.link,
          $price: data.price,
          $distance: data.distance,
          $extraData: data.extraData,
          $properties: data.properties.join(',')
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
      this.db.run('DELETE FROM `cars` WHERE `id` = ?', id, function (err) {
        if (err)
          reject(err);
        resolve(this.changes);
      });
    });
  }
};