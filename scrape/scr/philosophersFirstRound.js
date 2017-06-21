'use strict';

const router = require('express').Router();
const _flow = require('lodash').flow;
const request = require('request');
const cheerio = require('cheerio');
const chalk = require('chalk');

const db = require('../../db/index');
const AllData = db.model('all_data');
const Url = db.model('url');

const natLists = require('./dataLists/nationalitiesList');
const philLists = require('./dataLists/philosophersList');
const nationalities = natLists.nationalities;
const regions = natLists.regions;
const urlArray = philLists.firstArray;
const indicesSet = philLists.indices;
const missingIndices = philLists.missingIndices;
const missingPhilosophers = philLists.missingPhilosophers;


const done = chalk.bold.red;

// first round

/** problems:
// can't read `.trim()` of undefined, involving the `str` value: it's the `trimParens` function
6:    missing: 156,158,165,173,177,178,180
20:   missing: 522, 526, 530, 531, 532, 535, 537, 538, 539, 540, 544
34:   missing: 893,894,895,896,897,898,900,902,905
38:   missing: 991,996,997,1000,1011,1012
49:   missing: 1276,1280,1281,1284,1288,1289,1291
*/

/** did 
0000:   0,1,2,3,4,5,6,7,8,9
0010:   0,1,2,3,4,5,6,7,8,9
0020:   0,1,2,3,4,5,6,7,8,9
0030:   0,1,2,3,4,5,6,7,8,9
0040:   0,1,2,3,4,5,6,7,8,9
0050:   0,1,2,3,4,5,6,7,8,9
0060:   0
*/

// second round
/**problems: index number provided
1 (whole index set)
3: #18, #22
5 (whole index set)
6: except 35, 39
*/

/** did
000:  0,1,2,3,4,5,6 // done
*/
let num = 6;
let indices = missingIndices[num];

router.get('/', (req, res, next) => {
  for (let i = 0; i < indices.length; i++) {
    let url = `https://en.wikipedia.org${missingPhilosophers[indices[i]]}`;
    request(url, (err, res, html) => {
      if (err) console.log(err);
      else {
        const $ = cheerio.load(html);
        const phil = {
          name: '',
          url: '',
          born_node: false,
          birth_date: '',
          residency: '',
          dead_node: false,
          death_date: '',
          school_node: false,
          schools: null,
          interest_node: false,
          main_interests: null,
          ideas_node: false,
          notable_ideas: null,
          work_node: false,
          notable_works: null,
          influences_node: false,
          influences: null,
          influenced_node: false,
          influenced: null
        };
        const nodeBio = $('.vcard').children().first();
        const nodeWork = $('.biography').children().first();
        ////////////////
        ////
        ////  get url
        ////
        phil.url = url;

        ////////////////
        ////
        ////  get name
        ////

        let nodeName = $('#firstHeading').text();
        let name = trimParens(nodeName).trim();
        phil.name = name;

        ////////////////
        ////
        ////  get birth details
        ////

        let nodeBorn = findOneDeep($, nodeBio, 'Born');
        if (nodeBorn.children().length) {
          phil.born_node = true;
          let birth_date = nodeBorn.children().first().next().text().split('\n');
          let birthDateIndex; 
          let birthDate;
          const d = /\d/;
          for (let i = 0; i < birth_date.length; i++) {
            if (d.test(birth_date[i])) {
              birthDate = birth_date[i];
              birthDateIndex = i;
              break;
            }
          }
          phil.birth_date = getYear(birthDate);
          let locSpecific, locGeneral;
          let locations = birth_date.slice(birthDateIndex + 1);
          if (locations.length > 1) {
            locSpecific = locations[0];
            locGeneral = locations.slice(-1);
            let residency = `${locSpecific} ${locGeneral}`;
            phil.residency = trimParens(residency);
          } else {
            let residency = locations[0];
            phil.residency = trimParens(residency);
          }
        } else {
          phil.born_node = false;
        }

        ////////////////
        ////
        ////  get death
        ////

        let nodeDeath = findOneDeep($, nodeBio, 'Died');
        if (nodeDeath.children().length) {
          phil.dead_node = true;
          let death_date = nodeDeath.children().first().next().text().split('\n');
          let deathDate;
          const d = /\d/;
          for (let i = 0; i < death_date.length; i++) {
            if (d.test(death_date[i])) {
              deathDate = death_date[i];
              break;
            }
          }
          phil.death_date = getYear(deathDate);
        } else {
          phil.dead_node = false;
        }
        
        // the following three if cases: if there is a .vcard, but not the needed biographical data, search the bottom links for alteratives;
        let bottomLinks = $('#catlinks').children().first();
        const d = /\d/;
        if (!phil.birth_date) {
          let birth_date =
            bottomLinks
              .find('a')
              .filter(function(i, el) {
                return $(this).text().includes('births');
              })
              .text()
              .split(' ');
          let birthDate;
          for (let i = 0; i < birth_date.length; i++) {
            if(d.test(birth_date[i])) {
              birthDate = birth_date[i];
              break;
            }
          }
          phil.birth_date = birthDate;
        }

        if (!phil.residency) {
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
            let allText = '';
            bottomLinks
              .find('a')
              .each(function(i, el) {
                let currText = $(this).text().toLowerCase().split(' ').join(',');
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
          phil.residency = nationality;
        }
        
        if (!phil.death_date) {
          let death_date =
            bottomLinks
              .find('a')
              .filter(function(i, el) {
                return $(this).text().includes('death');
              })
              .text()
              .split(' ');
          let deathDate;
          for (let i = 0; i < death_date.length; i++) {
            if(d.test(death_date[i])) {
              deathDate = death_date[i];
              break;
            }
          }
          phil.death_date = deathDate;
        }

        ////////////////
        ////
        ////  get schools
        ////

        let nodeSchool = findTwoDeep($, nodeWork, 'School');
        if (nodeSchool.children().length) {
          phil.school_node = true;
          let schools = [];
          let children = nodeSchool.find('td').children();
          // case one: school infromation is displayed with <a> tags in <l1> tags
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                  let node = $(this);
                  if (isNotANote(node)) schools.push(createDataObj(node));
              });
          // case two: school information is displayed simply with <a> tags
          } else {
            children
              .each(function(i, el){
                if (!$(this).is('br')) {
                  let node = $(this);
                  if (isNotANote(node)) schools.push(createDataObj(node));
                }
              });
          }
          phil.schools = schools;
        } else {
          phil.school_node = false;
        }

        ////////////////
        ////
        ////  get main interests
        ////

        let nodeInterests = findTwoDeep($, nodeWork, 'Main interests');
        if (nodeInterests.children().length) {
          phil.interest_node = true;
          let interests = [];
          let children = nodeInterests.find('td').children();
          if (!children.length) {
            let node = nodeInterests.find('td');
            interests.push(createDataObj(node));
          }
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let node = $(this);
                if (isNotANote(node)) interests.push(createDataObj(node));
              });
          } else if (children.children().first().is('div')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let node = $(this);
                if (isNotANote(node)) interests.push(createDataObj(node));
              });
          } else {
            children
              .each(function(i, el){
                if (!$(this).is('br')) {
                  let node = $(this);
                  if (isNotANote(node)) interests.push(createDataObj(node));
                }
              });
          }
          phil.main_interests = interests;
        } else {
          phil.interest_node = false;
        }

        ////////////////
        ////
        ////  get notable ideas
        ////

        let notableIdeas = findTwoDeep($, nodeWork, 'Notable ideas');
        if (notableIdeas.children().length) {
          phil.ideas_node = true;
          let ideas = [];
          let children = notableIdeas.find('td').children();
          if (!children.length) {
            let node = notableIdeas.find('td');
            if (isNotANote(node)) ideas.push(createDataObj(node));
          }
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let node = $(this);
                if (isNotANote(node)) ideas.push(createDataObj(node));
              });
          } else if (children.children().first().is('div')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                  let node = $(this);
                  if (isNotANote(node)) ideas.push(createDataObj(node));
              });
          } else if (children.first().is('a')) {
            children
              .each(function(i, el){
                if ($(this).is('a')) {
                  let node = $(this);
                  if (isNotANote(node)) ideas.push(createDataObj(node));
                }
              });
          } else {
            children
              .find('a')
              .each(function(i, el){
                if ($(this).is('a')) {
                  let node = $(this);
                  if (isNotANote(node)) ideas.push(createDataObj(node));
                }
              });
          }
          phil.notable_ideas = ideas;
        } else {
          phil.ideas_node = false;
        }

        ////////////////
        ////
        ////  get notable works
        ////

        let notableWorks = findTwoDeep($, nodeWork, 'Notable work');
        if (notableWorks.children().length) {
          phil.work_node = true;
          let works = [];
          notableWorks
            .find('a')
            .each(function(i, el) {
              let node = $(this);
              if (isNotANote(node)) works.push(createDataObj(node));
            });
          phil.notable_works = works;
        } else {
          phil.work_node = false;
        }

        ////////////////
        ////
        ////  get influences/influenced
        ////

        const nodeInfluence_S = 
          $('.NavHead')
            .filter(function(i, el) {
              return $(this).text() === 'Influences';
            })
            .siblings();

        const nodeInfluence_D = 
          $('.NavHead')
            .filter(function(i, el) {
              return $(this).text() === 'Influenced';
            })
            .siblings();

        let influences = [];
        if (nodeInfluence_S.length) {
          phil.influences_node = true;
          nodeInfluence_S
            .find('a')
            .each(function(i, el) {
                let node = $(this);
                if (isNotANote(node)) {
                  checkUrl(node);
                  influences.push(createDataObj(node));
                }
            });

          phil.influences = influences;
        } else {
          phil.influences_node = false;
        }

        let influenced = [];
        if (nodeInfluence_D.length) {
          phil.influenced_node = true;
          let influencedList = nodeInfluence_D.text();
          if (isBigInfluencer(influencedList)) {
            influenced.push('****');
          } else {
            nodeInfluence_D
              .find('a')
              .each(function(i, el) {
                let node = $(this);
                if (isNotANote(node)) {
                  checkUrl(node);
                  influenced.push(createDataObj(node));
                }
              });
          } 

          phil.influenced = influenced;
        } else {
          phil.influenced_node = false;
        }
        AllData.create(phil);
        console.log(done(indices[i]));
      }
    });
  }
});

module.exports = router;

const trimParens = (str) => {
  let result = '';
  let inParens = false;
  if (str) {
    for (let i = 0; i < str.length; i++) {
      let s = str[i];
      if (inParens) { // if we are in parentheses
        if (s === ')' || s === ']') {
          inParens = false;
          continue;
        } else {
          continue;
        }
      }
      else { // if we are not in parentheses
        if (s === '(' || s === '[') {
          inParens = true;
          continue;
        } else {
          result += s;
        }
      }
    }
  return result;
  } else {
    return;
  }
};

const getYearOnly = (str) => {
  if (str) {
    let split = str.trim().split(' ');
    if (str.includes('or ')) return str.split(' or ').slice(-1).join().trim(); // imprecise date, e.g., '455 or 451'
    if (split[0].includes('c')) return split.slice(1).join(' '); // imprecise date, e.g., 'c. 420 BC'
    if (split.length > 2) return split.slice(-1).join(); // overly precise date, e.g., '12 April 1845'
  }
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

const isNotANote = (node) => {
  let href = node.attr('href') && node.attr('href').includes('#cite');
  let text = node.text() && node.text().includes('[');
  if (href || text) return false;
  return true;
};

const isBigInfluencer = (list) => {
  const regions = ['Western', 'Eastern', 'Indian', 'Chinese', 'Modern', 'Medieval', 'all ', 'All '];
  for (let i = 0; i < regions.length; i++) {
    if (list.includes(regions[i])) return true;
  }
  return false;
};

const createDataObj = (node) => {
  if (node.attr('href')) return `${node.text()} | ${node.attr('href')}`;
  return `${node.text()}`;
};

const findTwoDeep = ($, node, criterion) => {
  let returnNode = 
    node
      .children()
      .filter(function(i, el) {
        return $(this).children().first().children().first().text() === criterion;
      });
  return returnNode;
};

const checkUrl = (node) => {
  let name = node.text();
  let href = node.attr('href');
  if (href) {
    let address = `/wiki/${href.split('/').slice(-1)}`;
    if (!urlArray.includes(address)) {
      Url.create({name: name, url: address});
    }
  }
}