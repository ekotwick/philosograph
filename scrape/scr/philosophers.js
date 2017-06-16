'use strict';

const request = require('request');
const cheerio = require('cheerio');
const router = require('express').Router();
const db = require('../../db/index');
const Url = db.model('url');

router.get('/:span', (req, res, next) => { 
  const span = req.params.span;

  const links = {
    'a-c': 'https://en.wikipedia.org/wiki/List_of_philosophers_(A%E2%80%93C)',
    'd-h': 'https://en.wikipedia.org/wiki/List_of_philosophers_(D%E2%80%93H)',
    'i-q': 'https://en.wikipedia.org/wiki/List_of_philosophers_(I%E2%80%93Q)',
    'r-z': 'https://en.wikipedia.org/wiki/List_of_philosophers_(R%E2%80%93Z)',
  };
  const chars = {
    'a-c': ['A', 'B', 'C'],
    'd-h': ['D', 'E', 'F', 'G', 'H'],
    'i-q': ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'],
    'r-z': ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
  };

  const url = links[span];
  const letters = chars[span];

  letters.forEach(letter => {
    request(url, (err, res, html) => {
      if (err) console.log(err);
      else {

        let $ = cheerio.load(html);
        let loc = 'h2';

        $(loc)
          .filter(function(i, el) {
            return $(this).children().first().text() === letter;
          })
          .next()
          .find('li')
          .each(function(i, el) {
            let philosopher = {
              name: '',
              url: ''
            };
            let currName = $(this).children().first().text();
            let currUrl = $(this).children().first().attr('href');

            /** 
              listed philosophers without a page of their own have hrefs like "/w/index.php?..."
              this `if` filters those out 
            */
            if (currUrl[2] === 'i') {
              philosopher.name = currName;
              philosopher.url = currUrl;

              Url.create(philosopher);
            }
          });
      }
    });
  });
});

module.exports = router;