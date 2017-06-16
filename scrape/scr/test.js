const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');

const app = express();

app.get('/', (req, res, next) => {

  const urls = [
  'https://en.wikipedia.org/wiki/Aristotle',
  'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
  'https://en.wikipedia.org/wiki/Parmenides',
  'https://en.wikipedia.org/wiki/Nancy_Cartwright_(philosopher)'
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
        console.log('\n\n', url)
        // get lifetime data
        // birth
        let nodeBorn = findByFilter($, nodeBio, 'Born');
        if (nodeBorn) {
          // console.log('\n BORN \n')
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
          // console.log('\n DIED \n')
          nodeDeath = nodeDeath.children().first().next();
          let deathDate = nodeDeath.text();
          bio.deathDate = deathDate;
        }

        json.bio = bio;

        // get school
        let nodeSchool = findByFilterSchool($, nodeBio, 'School');
        if (nodeSchool) {
          let schools = [];
          let children = nodeSchool.find('td').children();
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let school = { name: '', href: '' };
                school.name = $(this).text();
                school.href = $(this).attr('href');
                schools.push(school);
              });
          } else if (children.children().first().is('div')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let school = { name: '', href: '' };
                school.name = $(this).text();
                school.href = $(this).attr('href');
                schools.push(school);
              });
          } else {
            children
              .each(function(i, el){
                if (!$(this).is('br')) {
                  let school = { name: '', href: '' };
                  school.name = $(this).text();
                  school.href = $(this).attr('href');
                  schools.push(school);
                }
              });
          }
          json.schools = schools;
        }
        // if (nodeSchool) {
        //   // console.log('\n SCHOOL \n')
        //   let schools = getItems($, nodeSchool);
        //   json.school = schools;
        // }

        // get interestes
        let nodeInterests = findByFilterSchool($, nodeBio, 'Main interests');
        if (nodeInterests) {
          // console.log(nodeInterests)
          let interests = [];
          let children = nodeInterests.find('td').children();
          if (!children.length) {
            console.log('\n\nhere\n\n')
            let interest = { name: '', href: '' };
            interest.name = nodeInterests.find('td').text();
            interest.href = nodeInterests.find('td').attr('href');
            interests.push(interest);
          }
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let interest = { name: '', href: '' };
                interest.name = $(this).text();
                interest.href = $(this).attr('href');
                interests.push(interest);
              });
          } else if (children.children().first().is('div')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let interest = { name: '', href: '' };
                interest.name = $(this).text();
                interest.href = $(this).attr('href');
                interests.push(interest);
              });
          } else {
            children
              .each(function(i, el){
                if (!$(this).is('br')) {
                  let interest = { name: '', href: '' };
                  interest.name = $(this).text();
                  interest.href = $(this).attr('href');
                  interests.push(interest);
                }
              });
          }
          json.mainInterests = interests;
        }

        // get notable ideas
        let notableIdeas = findByFilter($, nodeBio, 'Notable ideas');
        if (notableIdeas) {
          // console.log('\n IDEAS \n')
          let ideas = getItems($, notableIdeas);
          json.notableIdeas = ideas;
        }

        // get notable works
        let notableWorks = findByFilter($, nodeBio, 'Notable works');
        if (notableWorks) {
          // console.log('\n WORKS \n')
          let works = getItems($, notableWorks);
          json.notableWorks = works;
        }

        // get influences 
        let drewFrom = findByFilter($, nodeBio, 'Influences');
        if (drewFrom) {
          // console.log('\n INFLUENCES \n')
          let influences = getItems($, drewFrom);
          json.drewFrom = influences;
        }

        // get influenced
        let influenced = findByFilter($, nodeBio, 'Influenced');
        if (influenced) {
          // console.log('\n INFLUENCED \n')
          let followers = getItems($, influenced);
          json.influenced = followers;
        }

        console.log(JSON.stringify(json, null, 5));

      }
    });
  });
});

app.listen(3000, () => { console.log('listening on port 3000')});

module.exports = { app }

// const findByFilter = ($, node, criterion) => {
//   let returnNode = 
//     node
//       .children()
//       .filter(function(i, el) {
//         $(this)
//       })
// }

const findByFilter = ($, node, criterion) => {
  let returnNode = 
    // let th = node.find('tr').children().first();
    // if (th.children().first().is('div')) return th.children().first().text();
    // else return 
      // .find('th')
      // .filter(function(i, el) {
      //   return $(this).text() === criterion;
      // })
    node
      .children()
      .filter(function(i, el) {
        let titleNode = $(this).children().first();
        return titleNode.text() === criterion;
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

