'use strict';

const db = require('../../db/index');
const AllData = db.model('all_data');
const fs = require('fs');
const _flow = require('lodash').flow;

(function() {
  setTimeout(() => {
    AllData
      .findAll()
      .then(data => processData(data));

  }, 3000);
})();

const processData = _flow([
  filterData,
  createDataObj,
  JSONify
]);

function filterData(data) {
  return  data.filter(d => d.influences || d.influenced);
}

function createDataObj(data) {
  const philosophers = {};
  data.forEach(d => {
    const info = {};

    const philName = `${d.name} | ${d.url.split('/').slice(-1)}`;

    info.name = d.name;
    info.url = d.url;
    info.birth_year = d.birth_year;
    info.origin = d.residency;
    info.death_year = d.death_year;
    info.schools = trimUrls(d.schools);
    info.main_interests = trimUrls(d.main_interests);
    info.notable_ideas = trimUrls(d.notable_ideas);
    info.influences = trimUrls(d.influences);
    info.influenced = trimUrls(d.influenced);

    philosophers[philName] = info;
  })
  return philosophers;
};

function JSONify(dataObj) {
  fs.writeFile(`wiki_philosophers.json`, JSON.stringify(dataObj, null, 2), (err) => {
    if (err) console.log('\n\n',err,'\n\n');
    else console.log('\n\nSet successfully written to file!\n\n');
  });
};

const trimUrls = (obj) => {
  if (!obj) return null;
  return obj.map(el => el.split(' | ')[0]);
};

