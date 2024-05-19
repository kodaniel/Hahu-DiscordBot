import request from 'request';
import cheerio from 'cheerio';
import scrape from 'scrape-it';
import logger from 'winston';
import { Car } from '../persistence';
import { camelize } from '../utils';

export type PagedOptions = {
  url: string;
  location?: number;
  cookie?: string;
  page: number;
}

export class HttpApi {
  public async getCarsAllPages(options: PagedOptions): Promise<Car[]> {
    if (options.page > 1) {
      options.url += '/page' + options.page
    }

    let ret: Car[] = [];

    try {
      let cars = await this.getCars(options.url, options.location, options.cookie);

      // utolsó lap, nincs találat
      if (cars.length === 0) {
        return ret;
      }

      cars.forEach(function (car) {
        ret.push(car);
      })

      // next page - recursion
      options.page++;
      let list = await this.getCarsAllPages(options);
      if (list) {
        list.forEach(function (car) {
          ret.push(car);
        })
      }

      return ret;
    } catch (err) {
      logger.error(err);
      return [];
    }
  }

  public getCars(url: string, location?: number, cookie: string = ''): Promise<Car[]> {
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
        let page = scrape.scrapeHTML<{ cars: Car[] }>($, {
          cars: {
            listItem: ".row.talalati-sor",
            data: {
              ref: {
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
            },
            convert: function (obj: any) {
              obj.properties = obj.properties.map((p: string) => camelize(p.toLowerCase())).join(',');
              return obj;
            }
          }
        })

        resolve(page.cars);
      });
    });
  }
}