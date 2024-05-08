import sqlite3 from 'sqlite3';
import logger from 'winston';

export function initializeDb(connectionString) {
  const db = new sqlite3.Database(connectionString, (err) => {
    if (err) {
      return logger.error(err.message);
    }
    logger.info('Connected to the SQlite database.');
  });
  
  db.serialize(() => {
    // Create 'searches' table
    db.run('CREATE TABLE IF NOT EXISTS "searches" ( \
      "id" INTEGER NOT NULL, \
      "name" TEXT, \
      "url" TEXT, \
      "location" INTEGER, \
      "channelId" TEXT NOT NULL, \
      PRIMARY KEY("id" AUTOINCREMENT));')
  
    // Create 'cars' table
    db.run('CREATE TABLE IF NOT EXISTS "cars" ( \
      "id" INTEGER NOT NULL, \
      "searchId"	INTEGER NOT NULL, \
      "title" TEXT, \
      "description" TEXT, \
      "image" TEXT, \
      "link" TEXT, \
      "extraData" TEXT, \
      "properties" TEXT, \
      "price" TEXT, \
      "distance" REAL, \
      PRIMARY KEY("id"), \
      FOREIGN KEY("searchId") REFERENCES "searches"("id"));')
  });
  
  db.close();
}