const sqlite3 = require('sqlite3').verbose();
const HahuApi = require('./api');
const { EmbedBuilder } = require('discord.js');
const { SearchRepository, CarRepository } = require('../repositories');
const logger = require('winston');

module.exports = class HahuService {
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
    logger.info(`Interval: ${process.env.INTERVAL}mins`);

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

        logger.info(`${item.id} keresés figyelése...`);

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
            throw `Can't find channel with id ${item.channelId}`;

          await Promise.all(cars.map(async function (car) {
            let existingItem = await carsRepo.get(car.id);
            if (existingItem)
              return;

            logger.info(`Új autót találtam! ${car.title}`);

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