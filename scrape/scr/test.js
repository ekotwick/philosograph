const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

// app.get('/scrape', (req, res, next) => {

// 	// url to be scrapped
// 	// let url = `https://en.wikipedia.org/wiki/Aristotle`;
// 	// let url = `https://en.wikipedia.org/wiki/Ludwig_Wittgenstein`;
// 	let url = `https://en.wikipedia.org/wiki/Parmenides`;


// 	// structure of request call: 
// 	// first arg: url 
// 	// second arg: callback -> first arg: error, second: res, third: html
// 	request(url, (err, res, html) => {
// 		if (err) console.log(err);
// 		else {
// 			const $ = cheerio.load(html);
// 			const json = {
// 				influences: ''
// 			};

// 			const NavContent = '.NavContent';
// 			const NavHead = '.NavHead';

// 			// // let data = $(NavContent).map(elem => {
// 			// // 	return elem.children();
// 			// // });
// 			// // res.send(data);
// 			// let data = $(NavContent)['0'].children;
// 			// console.log(data);

// 			// let influences = $(NavContent).find('a').map((i, el) => $(this).attr('href'));

// 			//##### this gives me just one attribute, namely of the first item
// 			// influences = $(NavContent).find('a').attr('href');

// 			//##### this will give me a full list of all links to other pages
// 			// let data = [];
// 			// $(NavContent).find('a').each(function(i, elem) {
// 			// 	data[i] = $(this).attr('href');
// 			// });


// 			// ####wikipedia is retarded, so this doesn't work exactly right: 
// 			//  [ '\n\n\n\nParmenides\nSocrates\nPlato\nHeraclitus\nDemocritus\n\n\n\n',
// 			// 'Parmenides',
// 			// 'Socrates',
// 			// 'Plato',
// 			// 'Heraclitus',
// 			// // 'Democritus',
// 			// let data = [];
// 			// $(NavContent).find('li').each(function(i, elem) {
// 			// 	data[i] = $(this).text();
// 			// });
// 			// json.influences = data;

// 			// ### this gives me a list of influences
// 			// "{ influences: [ 'Parmenides', 'Socrates', 'Plato', 'Heraclitus', 'Democritus' ] }"
// 			// i get the influences only because of the uniqueness of Aristotle;
// 			// let data = [];
// 			// $(NavContent).find('.hlist').find('li').each(function(i, elem) {
// 			// 	data[i] = $(this).text();
// 			// });

// 			// let data = [];
// 			// $(NavHead).filter(function(i, el) {
// 			// 	return $(this).text() === 'Influences';
// 			// })
// 			// 	.siblings()
// 			// 	.find('li').each(function(i, el) {
// 			// 		data[i] = $(this).text();
// 			// 	})

// 			// #############################################################################

// 			let data = [];
// 			$(NavHead).filter(function(i, el) {
// 				return $(this).text() === 'Influenced';
// 			})
// 				.siblings()
// 				.find('li').each(function(i, el) {
// 					data[i] = $(this).text();
// 				});

// 			let 

// 			// $(NavHead).filter(function(i, el) {
// 			// 	return $(this).text() === 'Influences';
// 			// })
// 			// 	.siblings()
// 			// 	.find('li').each(function(i, el) {
// 			// 		data[i] = $(this).text();
// 			// 	});

// 			// #############################################################################


// 			json.influences = data;

// 			// filter(() => {
// 			// 	let data = $(this);
// 			// 	let influences = data.find('ul').length;
// 			// 	json.influences = influences;
// 			// });

// 			console.log(json);

// 		}
// 	})


// });


// #############################################################################
// #############################################################################
// #############################################################################
// #############################################################################
// ###############																						 #################
// ###############						FOR GETTING DATA								 #################
// ###############																						 #################
// #############################################################################
// #############################################################################
// #############################################################################

// app.get('/scrape', (req, res, next) => {

// 	// url to be scrapped
// 	// let url = `https://en.wikipedia.org/wiki/Aristotle`;
// 	// let url = `https://en.wikipedia.org/wiki/Ludwig_Wittgenstein`;
// 	let url = `https://en.wikipedia.org/wiki/Parmenides`;


// 	// structure of request call: 
// 	// first arg: url 
// 	// second arg: callback -> first arg: error, second: res, third: html
// 	request(url, (err, res, html) => {
// 		if (err) console.log(err);
// 		else {
// 			let $ = cheerio.load(html);
// 			let postPPL, postURL, getPPL, getURL;
// 			let json = {
// 				postPPL: [],
// 				postURL: [],
// 				getPPL: [],
// 				getURL: []
// 			};

// 			const NavHead = '.NavHead';

// 			postPPL = [];
// 			$(NavHead).filter(function(i, el) {
// 				return $(this).text() === 'Influenced';
// 			})
// 				.siblings()
// 				.find('li').each(function(i, el) {
// 					postPPL[i] = $(this).text();
// 				});

// 			postURL = [];
// 			$(NavHead).filter(function(i, el) {
// 				return $(this).text() === 'Influenced';
// 			})
// 				.siblings()
// 				.find('a').each(function(i, el) {
// 					postURL[i] = $(this).attr('href');
// 				});

// 			getPPL = [];
// 			$(NavHead).filter(function(i, el) {
// 				return $(this).text() === 'Influences';
// 			})
// 				.siblings()
// 				.find('li').each(function(i, el) {
// 					getPPL[i] = $(this).text();
// 				});

// 			getURL = [];
// 			$(NavHead).filter(function(i, el) {
// 				return $(this).text() === 'Influences';
// 			})
// 				.siblings()
// 				.find('a').each(function(i, el) {
// 					getURL[i] = $(this).attr('href');
// 				});

// 			json.postPPL = postPPL;
// 			json.postURL = postURL;
// 			json.getPPL = getPPL;
// 			json.getURL = getURL;

// 			console.log(json);

// 		}
// 	});


// });

app.get('/scrape', (req, res, next) => {

	const urls = ['https://en.wikipedia.org/wiki/Aristotle', 'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein', 'https://en.wikipedia.org/wiki/Parmenides'];

	const group = [];
	const NavHead = '.NavHead';


	urls.forEach(url => {
		request(url, (err, res, html) => {
			if (err) console.log(err);
			else {
				let $ = cheerio.load(html);
				let postPPL, postURL, getPPL, getURL;
				let json = {
					postPPL: [],
					postURL: [],
					getPPL: [],
					getURL: []
				};

				postPPL = [];
				$(NavHead).filter(function(i, el) {
					return $(this).text() === 'Influenced';
				})
					.siblings()
					.find('li').each(function(i, el) {
						postPPL[i] = $(this).text();
					});

				postURL = [];
				$(NavHead).filter(function(i, el) {
					return $(this).text() === 'Influenced';
				})
					.siblings()
					.find('a').each(function(i, el) {
						postURL[i] = $(this).attr('href');
					});

				getPPL = [];
				$(NavHead).filter(function(i, el) {
					return $(this).text() === 'Influences';
				})
					.siblings()
					.find('li').each(function(i, el) {
						getPPL[i] = $(this).text();
					});

				getURL = [];
				$(NavHead).filter(function(i, el) {
					return $(this).text() === 'Influences';
				})
					.siblings()
					.find('a').each(function(i, el) {
						getURL[i] = $(this).attr('href');
					});

				json.postPPL = postPPL;
				json.postURL = postURL;
				json.getPPL = getPPL;
				json.getURL = getURL;

				group.push(json);

				console.log(json);
			}
		});
	});
});



app.listen(3000, () => { console.log('listening on port 3000')});

module.exports = { app }


				// fs.writeFile(`phil_${letter}.json`, JSON.stringify(philosophers, null, 4), (err) => {
				// 	if (err) console.log(err);
				// 	else console.log('File successfully written!');
				// });