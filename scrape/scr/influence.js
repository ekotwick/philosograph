const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

app.get('/scrape', (req, res, next) => {

  const urls = ['https://en.wikipedia.org/wiki/Aristotle', 'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein', 'https://en.wikipedia.org/wiki/Parmenides'];

  const group = [];
  const NavHead = '.NavHead';


  urls.forEach(url => {
    request(url, (err, res, html) => {
      if (err) console.log(err);
      else {
        let $ = cheerio.load(html);
        let postPPL, postURL, getPPL, getURL;
        let json = {
          postPPL: [],
          getPPL: [],
        };

        postPPL = [];
        $(NavHead).filter(function(i, el) {
          return $(this).text() === 'Influenced';
        })
          .siblings()
          .find('li').each(function(i, el) {
            postPPL[i] = $(this).text();
          });

        getPPL = [];
        $(NavHead).filter(function(i, el) {
          return $(this).text() === 'Influences';
        })
          .siblings()
          .find('li').each(function(i, el) {
            getPPL[i] = $(this).text();
          });

        json.postPPL = postPPL;
        json.getPPL = getPPL;

        group.push(json);

        console.log(json);
      }
    });
  });
});



app.listen(3000, () => { console.log('listening on port 3000')});

module.exports = { app }