'use strict';

const router = require('express').Router();
const _flow = require('lodash').flow;
const request = require('request');
const cheerio = require('cheerio');
const chalk = require('chalk');

const db = require('../../db/index');
const AllData = db.model('all_data');
const Url = db.model('url');

const philLists = require('./dataLists/missingBirths');
const births = philLists.missingBirths;

const done = chalk.bold.red;
const curr = chalk.bold.blue;

let i = -1;
const getBirths = () => {
  setTimeout(() => {
    i++;
    if (i < births.length) {
    // if (i < 10) {
      request(births[i], (err, res, html) => {
        let newDate = 'empty';
        let birth_date;

        let $ = cheerio.load(html);
        let bottomLinks = $('#catlinks').children().first();

        let birthNode = getBirthNode($, bottomLinks);

        if (birthNode) {
          birth_date = birthNode.text();
          if (birth_date) {
            newDate = getDigits(birth_date) + checkforBC(birth_date);
          }
        }

        if (newDate !== 'empty') {
          let update = { birth_date: newDate };
          AllData.update(update, {
            where: {
              url: births[i]
            }
          });
        }
        console.log(curr(newDate));
        console.log(births[i]);
      });
      getBirths();
      // if (i === 9) {
      if (i === births.length - 1) {
        setTimeout(() => {
          console.log(done('\n\nDONE\n\n'));
        }, 2000);
      }
    } 
  }, 2000);
};

(function() {
  setTimeout(() => {
    getBirths();
  },5000);
})();

module.exports = router;

const getBirthNode = ($, node) => {
  return node
          .find('a')
          .filter(function(i, el) {
            return $(this).text().includes('-century');
          });
};

const checkforBC = (text) => {
  let bc = / BC/;
  if (bc.test(text)) return ' BC';
  else return '';
}

const getDigits = (text) => {
  let num = /\d+/;
  let n = text.match(num)[0];
  if (n === '1') return '00s';
  else return (n - 1) + '00s'; 
}