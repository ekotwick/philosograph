'use strict';

const fs = require('fs');
const router = require('express').Router();
const db = require('../../db/index');
const Url = db.model('url');
const UrlTrie = require('./sortingTrie').UrlTrie;


router.get('/:type', (req, res, next) => {
  let type = req.params.type;
  Url.findAll()
    .then(philsAndUrls => makeDataSet(type, philsAndUrls))
    .then(data => stringify(type, data));
});


module.exports = router;

const makeDataSet = (type, data) => {
  if (type === 'trie') return trieInsertion(data);
  else if (type === 'set') return setInsertion(data);
};

const trieInsertion = (data) => {
  let trie = new UrlTrie();
  data.forEach(datum => {
    let url = datum.url;
    trie.insert(url);
  });
  return trie;
};

const setInsertion = (data) => {
  let set = new Set();
  data.forEach(datum => {
    let url = datum.url;
    set.add(url);
  });
  return set;
};

const stringify = (type, dataSet) => {
  if (type === 'trie') return trieStringify(dataSet);
  else if (type === 'set') return setStringify(dataSet);
}

const trieStringify = (trie, cb) => {
  fs.writeFile(`first_rount_trie.json`, JSON.stringify(trie, null, 2), (err) => {
    if (err) console.log('\n\n',err,'\n\n');
    else console.log('\n\nTrie successfully written to file!\n\n');
  });
};

const setStringify = (set, cb) => {
  fs.writeFile(`first_round_set.json`, JSON.stringify([...set], null, 2), (err) => {
    if (err) console.log('\n\n',err,'\n\n');
    else console.log('\n\nSet successfully written to file!\n\n');
  });
};