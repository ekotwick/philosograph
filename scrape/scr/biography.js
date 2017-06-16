const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

app.get('/', (req, res, next) => {

  const urls = [
  'https://en.wikipedia.org/wiki/Aristotle',
  'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
  'https://en.wikipedia.org/wiki/Parmenides',
  'https://en.wikipedia.org/wiki/Nancy_Cartwright_(philosopher)'
  ];

  urls.forEach(url => {
    request(url, (err, res, html) => {
      if (err) console.log(err);
      else {
        ////////////////
        ////
        ////  starting object
        ////

        let $ = cheerio.load(html);
        let nodeBio = $('.vcard').children().first();

        ////////////////
        ////
        ////  returning object
        ////

        let json = {};

        ////////////////
        ////
        ////  get schools
        ////

        let nodeSchool = findByFilterSchool($, nodeBio, 'School');
        if (nodeSchool) {
          let schools = [];
          let children = nodeSchool.find('td').children();
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let school = { name: '', href: '' };
                school.name = $(this).text();
                school.href = $(this).attr('href');
                schools.push(school);
              });
          } else {
            children
              .each(function(i, el){
                if (!$(this).is('br')) {
                  let school = { name: '', href: '' };
                  school.name = $(this).text();
                  school.href = $(this).attr('href');
                  schools.push(school);
                }
              });
          }
          json.schools = schools;
        }

      }
    });
  });
});