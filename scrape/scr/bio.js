const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const _flow = require('lodash').flow;
const nationalities = require('./dataLists').nationalities;
const regions = require('./dataLists').regions;

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

        let nodeBorn = findOneDeep($, nodeBio, 'Born');
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
          bio.birthDate = getYear(birthDate);
          let locSpecific, locGeneral;
          let locations = birthData.slice(birthDateIndex + 1);
          if (locations.length > 1) {
            locSpecific = locations[0];
            locGeneral = locations.slice(-1);
            let birthPlace = `${locSpecific} ${locGeneral}`;
            bio.birthPlace = trimParens(birthPlace);
          } else {
            let birthPlace = locations[0];
            bio.birthPlace = trimParens(birthPlace);
          }
        } else {
          bioNodes.hasBornNode = false;
        }

        ////////////////
        ////
        ////  get death
        ////

        let nodeDeath = findOneDeep($, nodeBio, 'Died');
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
          bio.deathDate = getYear(deathDate);
        } else {
          bioNodes.hasDeathNode = false;
        }
        
        // the following three if cases: if there is a .vcard, but not the needed biographical data, search the bottom links for alteratives;
        let bottomLinks = $('#catlinks').children().first();
        const d = /\d/;
        if (!bio.birthDate) {
          let birthData =
            bottomLinks
              .find('a')
              .filter(function(i, el) {
                return $(this).text().includes('births');
              })
              .text()
              .split(' ');
          let birthDate;
          for (let i = 0; i < birthData.length; i++) {
            if(d.test(birthData[i])) {
              birthDate = birthData[i];
              break;
            }
          }
          bio.birthDate = birthDate;
        }

        if (!bio.birthPlace) {
          let possibleCountries = [];
          let notFound = true;
          let nationality;
          bottomLinks 
            .find('a')
            .filter(function(i, el) {
              return $(this).text().toLowerCase().includes('philosophers');
            })
            .each(function(i, el) {
              let kindOfPhilosopher = $(this).text().toLowerCase().split(' ')[0];
              possibleCountries.push(kindOfPhilosopher);
            });
          for (let i = 0; i < possibleCountries.length; i++) {
            if (nationalities[possibleCountries[i]]) {
              nationality = nationalities[possibleCountries[i]];
              notFound = false;
              break;
            }
          }
          if (notFound) {
            for (let i = 0; i < possibleCountries.length; i++) {
              if (regions[possibleCountries[i]]) {
                nationality = regions[possibleCountries[i]];
                notFound = false;
                break;
              }
            }
          }
          if (notFound) {
            let allText = [];
            bottomLinks
              .find('a')
              .each(function(i, el) {
                let currText = $(this).text().toLowerCase().split(' ');
                allText += currText + ',';
              })
            possibleCountries = allText.split(',');
            for (let i = 0; i < possibleCountries.length; i++) {
              if (nationalities[possibleCountries[i]]) {
                nationality = nationalities[possibleCountries[i]];
                notFound = false;
                break;
              }
            }
          }
          bio.birthPlace = nationality;
        }
        
        if (!bio.deathDate) {
          let deathData =
            bottomLinks
              .find('a')
              .filter(function(i, el) {
                return $(this).text().includes('death');
              })
              .text()
              .split(' ');
          let deathDate;
          for (let i = 0; i < deathData.length; i++) {
            if(d.test(deathData[i])) {
              deathDate = deathData[i];
              break;
            }
          }
          bio.deathDate = deathDate;
        }

        json.bioNodes = bioNodes;
        json.bio = bio;

        console.log(JSON.stringify(json, null, 5));

      }
    });
  });
});

const trimParens = (str) => {
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
  let split = str.trim().split(' ');
  if (str.includes('or')) return str.split(' or ').slice(-1).join().trim(); // imprecise date, e.g., '455 or 451'
  if (split[0].includes('c')) return split.slice(1).join(' '); // imprecise date, e.g., 'c. 420 BC'
  if (split.length > 2) return split.slice(-1).join(); // overly precise date, e.g., '12 April 1845'
  return str;
};

const findOneDeep = ($, node, criterion) => {
  let returnNode = 
    node
      .children()
      .filter(function(i, el) {
        let titleNode = $(this).children().first();
        return titleNode.text() === criterion;
      });
  return returnNode;
};

const getYear = _flow([trimParens, getYearOnly]);