'use strict';

const fs = require('fs');
const router = require('express').Router();
const db = require('../../db/index');
const Url = db.model('url');
const UrlTrie = require('./sortingTrie').UrlTrie;

router.get('/', (req, res, next) => {

	Url.findAll()
		.then(philsAndUrls => {
			let urlTrie = new UrlTrie();
			philsAndUrls.forEach(set => {
				let url = set.url; 
				urlTrie.insert(url);
			});
			return urlTrie;
		})
		.then(trie => {
			fs.writeFile(`first_round_urls.json`, JSON.stringify(trie, null, 2), (err) => {
				if (err) console.log('\n\n',err,'\n\n');
				else console.log('\n\nFile successfully written!\n\n');
			});
		});

});

module.exports = router;