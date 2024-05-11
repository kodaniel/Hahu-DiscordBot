import sqlite3 from 'sqlite3';
import HahuApi from './api.js';
import { EmbedBuilder } from 'discord.js';
import { SearchRepository, CarRepository } from '../repositories/index.js';
import logger from 'winston';

export default class HahuService {
  interval;
  #api;
  #client;
  #timer;

  constructor(client) {
    this.#client = client;
    this.#api = new HahuApi();
    this.interval = process.env.INTERVAL * 1000 * 60;
  }

  start() {
    logger.info(`⏱️ Polling interval: ${process.env.INTERVAL} mins`);

    this.#timer = this.#doWork();
  }

  stop() {
    if (this.#timer) {
      this.#timer.stop();
    }
  }

  async #doWork() {
    const dbConnection = new sqlite3.Database(process.env.DB_NAME);
    const searchesRepo = new SearchRepository(dbConnection);
    const carsRepo = new CarRepository(dbConnection);

    const searches = await searchesRepo.listAll();
    const this_ = this;

    if (searches && searches.length > 0) {

      for (const item of searches) {

        logger.info(`Fetching search id #${item.id}...`);

        const options = {
          url: item.url,
          location: item.location,
          cookie: process.env.COOKIE_DEFAULT,
          page: 1
        };

        try {
          const cars = await this.#api.getCarsAllPages(options);

          const channel = this_.#client.channels.cache.get(item.channelId);
          if (!channel)
            throw `Can't find channel with id #${item.channelId}`;

          await Promise.all(cars.map(async function (car) {
            let existingItem = await carsRepo.get(car.id);
            if (existingItem)
              return;

            logger.info(`🚗 Found new car! ${car.title}`);

            car.searchId = item.id;
            await carsRepo.add(car);

            sendEmbedMessage(channel, car);
          }));
        } catch (err) {
          logger.error(err);
        }
      }
    }

    dbConnection.close();

    let timer = setTimeout(() => {
      this.#doWork();
    }, this.interval);

    return stop;

    function stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  }
}

function sendEmbedMessage(channel, car) {
  const embed = new EmbedBuilder()
    .setAuthor({ name: 'Használtautó.hu', iconURL: 'https://i.imgur.com/ITHCYF3.png', url: 'https://www.hasznaltauto.hu' })
    .setTitle(car.title)
    .setDescription(car.description)
    .setURL(car.link)
    .setThumbnail(car.image)
    .addFields(
      { name: 'Tulajdonságok', value: car.properties.map(p => camelize(p.toLowerCase())).join(', ') },
      { name: 'Adatok', value: car.extraData.replaceAll(',', ', ') },
      { name: 'Ár', value: car.price ? car.price : '-', inline: true },
      { name: 'Távolság', value: car.distance ? car.distance : '-', inline: true },
    );

  channel.send({ embeds: [embed] });
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index === 0 ? match.toUpperCase() : match;
  });
}