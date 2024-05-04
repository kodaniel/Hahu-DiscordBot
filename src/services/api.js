const request = require('request');
const cheerio = require('cheerio');
const scrape = require('scrape-it');

module.exports = class {
  getCarsAllPages(url, page, ret, done) {
    const _this = this;
    if (page > 1) {
      url += '/page' + page
    }
  
    _this.getCars(url, function(err, list) {
      if (err !== null) {
        return done(err)
      }
      // utolsó lap, nincs találat
      if (list.cars.length === 0) {
        return done(null, ret)
      }
  
      list.cars.forEach(function(car) {
        ret.cars.push(car)
      })
  
      // next page - recursion
      _this.getCarsAllPages(url, page + 1, ret, done)
    })
  }

  getCars(url, done) {
    request({
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
        'Cookie': ''
      }
    }, function (err, response, body) {
      if (err) {
        return done(err);
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
            distance: ".talalatisor-info tavolsaginfo .tavolsag_talalati"
          }
        }
      })

      done(null, page);
    })
  }
}