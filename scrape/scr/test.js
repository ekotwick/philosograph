const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

app.get('/', (req, res, next) => {

  const urls = [
  'https://en.wikipedia.org/wiki/Aristotle',
  'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
  'https://en.wikipedia.org/wiki/Parmenides'
  ];

  urls.forEach(url => {
    request(url, (err, res, html) => {
      if (err) console.log(err);
      else {
        let $ = cheerio.load(html);
        let json = {}

        let bio = {};
        let nodeBio = $('.vcard').children().first();
        // get name
        let nodeName = 
          nodeBio
            .find($('.fn'));
        let name = nodeName.text();
        bio.name = name;

        // get lifetime data
        // birth
        let nodeBorn = findByFilter($, nodeBio, 'Born');
        if (nodeBorn) {
          nodeBorn = nodeBorn.children().first().next();
          let birthDate = nodeBorn.text();
          bio.birthDate = birthDate;
          // if birthplace
          let nodeBirthPlace = nodeBorn.find($('.birthplace'));
          if (nodeBirthPlace) {
            let birthPlace = nodeBirthPlace.text();
            bio.birthPlace = birthPlace;
          }
        }
        // death
        let nodeDeath = findByFilter($, nodeBio, 'Died');
        if (nodeDeath) {
          nodeDeath = nodeDeath.children().first().next();
          let deathDate = nodeDeath.text();
          bio.deathDate = deathDate;
        }

        json.bio = bio;

        // get school
        let nodeSchool = findByFilterSchool($, nodeBio, 'School');
        if (nodeSchool) {
          let schools = getItems($, nodeSchool);
          json.school = schools;
        }

        // get interestes
        let nodeInterests = findByFilter($, nodeBio, 'Main Interests');
        if (nodeInterests) {
          let interests = getItems($, nodeInterests);
          json.mainInterests = interests;
        }

        // get notable ideas
        let notableIdeas = findByFilter($, nodeBio, 'Notable Ideas');
        if (notableIdeas) {
          let ideas = getItems($, notableIdeas);
          json.notableIdeas = ideas;
        }

        // get notable works
        let notableWorks = findByFilter($, nodeBio, 'Notable Works');
        if (notableWorks) {
          let works = getItems($, notableWorks);
          json.notableWorks = works;
        }

        // get influences 
        let drewFrom = findByFilter($, nodeBio, 'Influences');
        if (drewFrom) {
          let influences = getItems($, drewFrom);
          json.drewFrom = influences;
        }

        // get influenced
        let influenced = findByFilter($, nodeBio, 'Influenced');
        if (influenced) {
          let followers = getItems($, influenced);
          json.influenced = followers;
        }

        console.log(JSON.stringify(json, null, 2));

      }
    });
  });
});

app.listen(3000, () => { console.log('listening on port 3000')});

module.exports = { app }

const findByFilter = ($, node, criterion) => {
  let returnNode = 
    node
      .children()
      .filter(function(i, el) {
        return $(this).children().first().text() === criterion;
      });
  return returnNode;
}

const findByFilterSchool = ($, node, criterion) => {
  let returnNode = 
    node
      .children()
      .filter(function(i, el) {
        return $(this).children().first().children().first().text() === criterion;
      });
  return returnNode;
}

const getItems = ($, node) => {
  let ul = node.find('ul');
  if (!ul) return node.text();
  else {
    let returnData = []
    ul
      .find('li')
      .each(function(i, el) {
        returnData.push($(this).text());
      });
    return returnData;
  }
}

        /**
            GET BIO
        */



        // let nameNode = $('.fn');
        // let name = nameNode.text();

        // let birtNode = 



        // let postPPL = [];
        // $(NavHead).filter(function(i, el) {
        //   return $(this).text() === 'Influenced';
        // })
        //   .siblings()
        //   .find('li').each(function(i, el) {
        //     postPPL[i] = $(this).text();
        //   });

        // let postURL = [];
        // $(NavHead).filter(function(i, el) {
        //   return $(this).text() === 'Influenced';
        // })
        //   .siblings()
        //   .find('a').each(function(i, el) {
        //     postURL[i] = $(this).attr('href');
        //   });

        // let getPPL = [];
        // $(NavHead).filter(function(i, el) {
        //   return $(this).text() === 'Influences';
        // })
        //   .siblings()
        //   .find('li').each(function(i, el) {
        //     getPPL[i] = $(this).text();
        //   });

        // let getURL = [];
        // $(NavHead).filter(function(i, el) {
        //   return $(this).text() === 'Influences';
        // })
        //   .siblings()
        //   .find('a').each(function(i, el) {
        //     getURL[i] = $(this).attr('href');
        //   });

        // json.postPPL = postPPL;
        // json.postURL = postURL;
        // json.getPPL = getPPL;
        // json.getURL = getURL;

        // group.push(json);

        // console.log(json);

