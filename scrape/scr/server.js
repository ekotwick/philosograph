const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

app.get('/scrape', (req, res, next) => { 
	// const urls = [
	// 	'https://en.wikipedia.org/wiki/List_of_philosophers_(A%E2%80%93C)',
	// 	'https://en.wikipedia.org/wiki/List_of_philosophers_(D%E2%80%93H)',
	// 	'https://en.wikipedia.org/wiki/List_of_philosophers_(I%E2%80%93Q)',
	// 	'https://en.wikipedia.org/wiki/List_of_philosophers_(R%E2%80%93Z)',
	// ];

	const url = 'https://en.wikipedia.org/wiki/List_of_philosophers_(A%E2%80%93C)';
	const letters = ['A', 'B', 'C'];

	console.log('IN THE GET');

	letters.forEach(letter => {
		request(url, (err, res, html) => {
			if (err) console.log(err);
			else {
				let $ = cheerio.load(html);
				let philosophers = [];

				// let loc = '.mw-headline';

				// $(loc).filter(function(i, el) {
				// 	console.log(el)
				// 	return $(this).text() === letter;
				// })
				// 	.parent()
				// 	.siblings()
				// 	.find('a').each(function(i, el) {
				// 		console.log('here');
				// 		let philosopher = {};
				// 		philosopher.name = $(this).text();
				// 		philosopher.url = $(this).attr('href');
				// 		philosophers.push(philosopher);
				// 	});

				let loc = 'h2';

				let data = $(loc).filter(function(i, el) {
					// console.log($(this).children().first().text());
					return $(this).children().first().text() === letter;
				})
					.next()
					.find('li')
					.each(function(i, el) {
						let phil = {};
						phil.name = $(this).children().first().text();
						phil.url = $(this).children().first().attr('href');
						philosophers.push(phil);
					})

					console.log(data);

				// console.log(data.length);
					// .siblings()
					// .find('a')
					// .each(function(i, el) {
					// 	let phil = {};
					// 	phil.name = $(this).text();
					// 	phil.url = $(this).attr('href');
					// 	philosophers.push(phil);
					// })

				// console.log(data.length);
					// .siblings()
					// .find('a').each(function(i, el) {
					// 	console.log('here');
					// 	let phil = {};
					// 	phil.name = $(this).text();
					// 	phil.url = $(this).attr('href');
					// 	philosophers.push(phil);
					// });

				// let loc = 'h2';

				// $(loc)
				// 	.contents()
				// 	.find('li')
				// 	.each(function(i, el) {
				// 		let phil = {};
				// 		phil.name = $(this).text();
				// 		phil.url = $(this).attr('href');
				// 		philosophers.push(phil);
				// 	});

				console.log(philosophers);
			}

		});

	});


});



app.listen(3000, () => { console.log('listening on port 3000')});

module.exports = { app }