import sqlite3 from 'sqlite3';
import { HttpApi, PagedOptions } from './api';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { Car, SearchRepository, CarRepository } from '../persistance';
import logger from 'winston';

export class HahuService {
  private interval: number;
  private api: HttpApi;
  private client: Client;
  private stopCallback: Function | null = null;
  private dbName: string;

  constructor(client: Client) {
    const { INTERVAL, DB_NAME } = process.env;

    if (!DB_NAME) {
      throw 'Database connection string is missing';
    }

    this.client = client;
    this.api = new HttpApi();
    this.dbName = DB_NAME;

    let interval = parseFloat(INTERVAL || '') || 10;
    this.interval = interval * 1000 * 60;
  }

  public setInterval(interval: number) {
    this.interval = interval * 1000 * 60;
  }

  private getIntervalText() {
    let time: string;
    if (this.interval >= 60000)
      time = `${this.interval / 60000} mins`;
    else
      time = `${this.interval / 1000} secs`;

    return time;
  }

  public async start() {
    logger.info(`⏱️ Polling interval: ${this.getIntervalText()}`);

    this.stopCallback = await this.doWork();
  }

  public stop() {
    if (this.stopCallback) {
      this.stopCallback();
    }
  }

  private async doWork(): Promise<Function> {
    const dbConnection = new sqlite3.Database(this.dbName);
    const searchesRepo = new SearchRepository(dbConnection);
    const carsRepo = new CarRepository(dbConnection);

    const searches = await searchesRepo.listAll();
    const this_ = this;

    if (searches && searches.length > 0) {

      for (const item of searches) {

        logger.info(`Fetching search id #${item.id}...`);

        const options: PagedOptions = {
          url: item.url,
          location: item.location,
          cookie: process.env.COOKIE_DEFAULT,
          page: 1
        };

        try {
          const channel = this_.client.channels.cache.get(item.channelId!) as TextChannel;
          if (!channel)
            throw `Can't find channel with id #${item.channelId}`;

          const cars = await this.api.getCarsAllPages(options);
          await Promise.all(cars.map(async function (car) {
            if (!car.id)
              return;

            let existingItem = await carsRepo.get(car.id);
            if (existingItem)
              return;

            logger.info(`🚗 Found new car! ${car.title}`);

            car.searchId = item.id;
            await carsRepo.add(car);

            this_.sendEmbedMessage(channel, car);
          }));
        } catch (err) {
          logger.error(err);
        }
      }
    }

    dbConnection.close();

    let timer: NodeJS.Timeout | null = setTimeout(async () => {
      await this.doWork();
    }, this.interval);

    return stop;

    function stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  }

  private sendEmbedMessage(channel: TextChannel, car: Car) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Használtautó.hu', iconURL: 'https://i.imgur.com/ITHCYF3.png', url: 'https://www.hasznaltauto.hu' })
      .setTitle(car.title)
      .setDescription(car.description)
      .setURL(car.link)
      .setThumbnail(car.image)
      .addFields(
        { name: 'Tulajdonságok', value: car.properties.replaceAll(',', ', ') },
        { name: 'Adatok', value: car.extraData.replaceAll(',', ', ') },
        { name: 'Ár', value: car.price ? car.price : '-', inline: true },
        { name: 'Távolság', value: car.distance ? car.distance : '-', inline: true },
      );

    channel.send({ embeds: [embed] });
  }
}