'use strict';

const fs = require('fs');
const router = require('express').Router();
const db = require('../../db/index');
const Url = db.model('url');
const UrlTrie = require('./sortingTrie').UrlTrie;
const AllData = db.model('all_data');


router.get('/:model/:dataStructure/:dataItem', (req, res, next) => {
  let ds = req.params.dataStructure;
  let item = req.params.dataItem;
  let model = req.params.model;
  let table = model === 'url' ? Url : AllData;
  table.findAll()
    .then(data => makeDataSet(ds, data, item))
    .then(data => stringify(ds, data));
});


module.exports = router;

const makeDataSet = (ds, data, item) => {
  console.log(data.length, ds, item);
  if (ds === 'trie') return trieInsertion(data, item);
  else if (ds === 'set') return setInsertion(data, item);
};

const trieInsertion = (data, item) => {
  let trie = new UrlTrie();
  data.forEach(datum => {
    let val = datum[item];
    trie.insert(val);
  });
  return trie;
};

const setInsertion = (data, item) => {
  let set = new Set();
  data.forEach(datum => {
    let val = datum[item];
    set.add(val);
  });
  return set;
};

const stringify = (ds, dataSet) => {
  if (ds === 'trie') return trieStringify(dataSet);
  else if (ds === 'set') return setStringify(dataSet);
}

const trieStringify = (trie, cb) => {
  fs.writeFile(`first_rount_trie.json`, JSON.stringify(trie, null, 2), (err) => {
    if (err) console.log('\n\n',err,'\n\n');
    else console.log('\n\nTrie successfully written to file!\n\n');
  });
};

const setStringify = (set, cb) => {
  fs.writeFile(`eight_round_urls.json`, JSON.stringify([...set], null, 2), (err) => {
    if (err) console.log('\n\n',err,'\n\n');
    else console.log('\n\nSet successfully written to file!\n\n');
  });
};