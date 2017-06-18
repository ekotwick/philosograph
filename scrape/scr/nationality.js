const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const _flow = require('lodash').flow;

const app = express();

app.get('/', (req, res, next) => {

  const url = 'http://www.vocabulary.cl/Basic/Nationalities.htm';


  request(url, (err, res, html) => {
    if (err) console.log(err);
    else {
      console.log('\n\n', url);

      let $ = cheerio.load(html);
      let nationalityHash = {};

      // let natTable = 
      $('tr')
        .filter(function(i, el) {
          return $(this).text().includes('Country');
        })
        .siblings()
        .each(function(i, el) {
          let country = $(this).children().first().text().trim();
          let nationality = $(this).children().first().next().text().toLowerCase().trim();
          nationalityHash[nationality] = country;
        });

      console.log(JSON.stringify(nationalityHash, null, 5));

    }
  });

});

app.listen(3000, () => { console.log('listening on port 3000')});