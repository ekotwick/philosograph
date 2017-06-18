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
  'https://en.wikipedia.org/wiki/Nancy_Cartwright_(philosopher)',
  'https://en.wikipedia.org/wiki/Thomas_Aquinas'
  ];

  urls.forEach(url => {
    request(url, (err, res, html) => {
      if (err) console.log(err);
      else {
        console.log('\n\n', url)

        let $ = cheerio.load(html);
        let json = {}

        let bio = {};
        let bioNodes = {};
        let nodeBio = $('.vcard').children().first();

        ////////////////
        ////
        ////  get name
        ////

        let nodeName = 
          nodeBio
            .find($('.fn'));
        let name = nodeName.text();
        bio.name = name;

        ////////////////
        ////
        ////  get birth details
        ////

        let nodeBorn = findByFilter($, nodeBio, 'Born');
        let hasBornNode;
        if (nodeBorn.children().length) {
          bioNodes.hasBornNode = true;
          let birthData = nodeBorn.children().first().next().text().split('\n');
          let birthDateIndex; 
          let birthDate;
          const d = /\d/;
          for (let i = 0; i < birthData.length; i++) {
            if (d.test(birthData[i])) {
              birthDate = birthData[i];
              birthDateIndex = i;
              break;
            }
          }
          bio.birthDate = getYearOnly(trimParens(birthDate));
          let locSpecific, locGeneral;
          let locations = birthData.slice(birthDateIndex + 1);
          if (locations.length > 1) {
            locSpecific = locations[0];
            locGeneral = locations.slice(-1);
            bio.birthPlace = `${locSpecific} ${locGeneral}`;
          } else {
            bio.birthPlace = locations[0];
          }
        } else {
          bioNodes.hasBornNode = false;
        }

        ////////////////
        ////
        ////  get death
        ////

        let nodeDeath = findByFilter($, nodeBio, 'Died');
        let hasDeathNode;
        if (nodeDeath.children().length) {
          bioNodes.hasDeathNode = true;
          let deathData = nodeDeath.children().first().next().text().split('\n');
          let deathDate;
          const d = /\d/;
          for (let i = 0; i < deathData.length; i++) {
            if (d.test(deathData[i])) {
              deathDate = deathData[i];
              break;
            }
          }
          bio.deathDate = getYearOnly(trimParens(deathDate));
        } else {
          bioNodes.hasDeathNode = false;
        }

        json.bioNodes = bioNodes;
        json.bio = bio;

        console.log(JSON.stringify(json, null, 5));

      }
    });
  });
});

const trimParens = (str) => {
  console.log(str);
  let result = '';
  let inParens = false;
  for (let i = 0; i < str.length; i++) {
    let s = str[i];
    if (inParens) { // if we are not in parentheses
      if (s === ')' || s === ']') {
        inParens = false;
        continue;
      } else {
        continue;
      }
    }
    else { // if we are in parentheses
      if (s === '(' || s === '[') {
        inParens = true;
        continue;
      } else {
        result += s;
      }
    }
  }
  return result;
};

const getYearOnly = (str) => {
  if (str.trim().split(' ').length > 2) return str.trim().split(' ').slice(-1).join();
  return str;
};
