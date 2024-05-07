const request = require('request');
const cheerio = require('cheerio');
const scrape = require('scrape-it');
const logger = require('winston');

module.exports = class HttpApi {
  async getCarsAllPages({ url, location, cookie, page }) {
    if (page > 1) {
      url += '/page' + page
    }

    let ret = [];

    try {
      let list = await this.getCars({ url, location, cookie });

      // utolsó lap, nincs találat
      if (list.cars.length === 0) {
        return ret;
      }

      list.cars.forEach(function (car) {
        ret.push(car);
      })

      // next page - recursion
      let list2 = await this.getCarsAllPages({ url, location, cookie, page: page + 1 });
      list2.forEach(function (car) {
        ret.push(car);
      })

      return ret;
    } catch (err) {
      logger.error(err);
    }
  }

  getCars({ url, location, cookie = '' }) {
    if (location != null)
      cookie += `telepules_id_user=${location}; telepules_saved=1; visitor_telepules=${location};`;

    return new Promise((resolve, reject) => {
      request({
        url: url,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
          'Cookie': cookie
        }
      }, function (err, response, body) {
        if (err) {
          return reject(err);
        }

        let $ = cheerio.load(body);
        let page = scrape.scrapeHTML($, {
          cars: {
            listItem: ".row.talalati-sor",
            data: {
              id: {
                selector: ".cim-kontener h3 a",
                attr: "href",
                convert: function (s) {
                  const url = new URL(s);
                  return url.pathname.split("-").pop();
                }
              },
              link: {
                selector: ".cim-kontener h3 a",
                attr: "href"
              },
              title: ".cim-kontener h3 a",
              description: ".talalatisor-infokontener .hidden-xs",
              image: {
                selector: ".talalatisor-kep img",
                attr: "src"
              },
              price: ".price-fields-desktop .pricefield-primary",
              extraData: ".talalatisor-info.adatok .info",
              distance: ".talalatisor-info tavolsaginfo .tavolsag_talalati",
              properties: {
                listItem: ".cimke-lista .label"
              }
            }
          }
        })

        resolve(page);
      });
    });
  }
}