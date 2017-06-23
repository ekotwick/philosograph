'use strict';

const fs = require('fs');
const router = require('express').Router();
const db = require('../../db/index');
const AllData = db.model('all_data');


router.get('/birth', (req, res, next) => {
  let name = `missing_birth_date.json`;
  AllData.findAll({
    where: {
      birth_date: null
    }
  })
    .then(data => createDataObj(data))
    .then(data => stringify(data, name));
});

router.get('/death', (req, res, next) => {
  let name = `missing_death_date.json`;
  AllData.findAll({
    where: {
      death_date: null
    }
  })
    .then(data => createDataObj(data))
    .then(data => stringify(data, name));
});

router.get('/residency', (req, res, next) => {
  let name = `missing_residency_date.json`;
  AllData.findAll({
    where: {
      residency: null
    }
  })
    .then(data => createDataObj(data))
    .then(data => stringify(data, name));
});

module.exports = router;

const createDataObj = (data) => {
  let obj = {};
  data.forEach(datum => {
    let key = datum.id;
    let val = datum.url;
    obj[key] = val;
  });
  return obj;
};

const stringify = (obj,name) => {
  fs.writeFile(name, JSON.stringify(obj, null, 2), (err) => {
    if (err) console.log('\n\n',err,'\n\n');
    else console.log('\n\nSet successfully written to file!\n\n');
  });
};