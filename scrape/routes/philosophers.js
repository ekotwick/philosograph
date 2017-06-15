const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

app.get('/scrape', (req, res, next) => { 
	const links = {
		'a-c': 'https://en.wikipedia.org/wiki/List_of_philosophers_(A%E2%80%93C)',
		'd-h': 'https://en.wikipedia.org/wiki/List_of_philosophers_(D%E2%80%93H)',
		'i-q': 'https://en.wikipedia.org/wiki/List_of_philosophers_(I%E2%80%93Q)',
		'r-z': 'https://en.wikipedia.org/wiki/List_of_philosophers_(R%E2%80%93Z)',
	};
	const chars = {
		'a-c': ['A', 'B', 'C'],
		'd-h': ['D', 'E', 'F', 'G', 'H'],
		'i-q': ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'],
		'r-z': ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
	};

	const url = links['r-z'];
	const letters = chars['r-z'];

	letters.forEach(letter => {
		request(url, (err, res, html) => {
			if (err) console.log(err);
			else {

				let $ = cheerio.load(html);
				let philosophers = {};
				let loc = 'h2';

				$(loc)
					.filter(function(i, el) {
						return $(this).children().first().text() === letter;
					})
					.next()
					.find('li')
					.each(function(i, el) {
						let name = $(this).children().first().text();
						let currUrl = $(this).children().first().attr('href');
						philosophers[name] = currUrl;
					});

				console.log(JSON.stringify(philosophers, null, 4));

				fs.writeFile(`philosophers_${letter}.json`, JSON.stringify(philosophers, null, 4), (err) => {
					if (err) console.log(err);
					else console.log('File successfully written!');
				});
			}
		});
	});
});

app.listen(3000, () => { console.log('listening on port 3000')});

module.exports = { app }