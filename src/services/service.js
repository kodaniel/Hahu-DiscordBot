const fs = require('node:fs');
const path = require('node:path');
const _ = require("lodash");
const async = require('async');
const HahuApi = require('./api');
const { EmbedBuilder } = require('discord.js');

const dataDir = path.join(__dirname, '../..', 'data');

module.exports = class {
  interval = 10000;
  #api;
  #client;

  constructor(client) {
    this.#client = client;
    this.#api = new HahuApi();
  }

  start() {
    this.#doWork();
  }

  #doWork() {
    const searches = this.#getSearches();
    const this_ = this;

    if (searches && searches.length > 0) {

      const oldLists = this.#loadLists(searches);

      const ret = {
        cars: [],
      }

      for (const item of searches) {

        console.log(`${item.id} keresés figyelése...`);

        this.#api.getCarsAllPages(item.url, 1, ret, function (err, list) {
          if (err)
            return console.error(err);

          fs.writeFileSync(path.join(dataDir, item.id + ".json"), JSON.stringify(list, null, 4));

          // Diff
          list.cars.forEach(function (car) {

            let oldItem;
            if (oldLists[item.id] && oldLists[item.id].cars) {
              oldItem = _.find(oldLists[item.id].cars, item => item.id == car.id);
            }

            if (!oldItem) {
              console.log(`Új autót találtam! ${car.title}`);

              const embed = new EmbedBuilder()
                .setAuthor({ name: 'Használtautó.hu', iconURL: 'https://www.hasznaltauto.hu/favicon.ico', url: 'https://www.hasznaltauto.hu' })
                .setTitle(car.title)
                .setDescription(car.description)
                .setURL(car.link)
                .setThumbnail(car.image)
                .addFields(
                  { name: 'Adatok', value: car.extraData.replaceAll(',', ', ') },
                  { name: 'Ár', value: car.price, inline: true },
                  { name: 'Távolság', value: car.distance ? car.distance : '-', inline: true },
                );

              if (item.channel) {
                this_.#client.channels.cache.get(item.channel).send({ embeds: [embed] });
              } else {
                this_.#client.channel.send({ embeds: [embed] });
              }

              console.log(car);
            }
          });

          item.lastResult = list;
        })
      }
    }

    setTimeout(() => {
      this.#doWork();
    }, 10000);
  }

  #loadLists(searches) {
    const items = {};
    if (searches && searches.length > 0) {
      for (const item of searches) {
        console.log("A(z) " + item.id + " lista betöltése fájlból...");

        var fileName = path.join(dataDir, item.id + ".json");
        if (fs.existsSync(fileName)) {
          try {
            const data = fs.readFileSync(fileName);

            items[item.id] = JSON.parse(data);
          } catch (e) {
            console.log("Fájl formátum hiba!");
          }
        }
      }
    }

    return items;
  }

  #getSearches() {
    const configPath = path.join(dataDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      return [];
    }

    const config = JSON.parse(fs.readFileSync(configPath));
    return config.searches;
  }
}