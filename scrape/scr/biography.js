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
        ////////////////
        ////
        ////  starting object
        ////

        let $ = cheerio.load(html);
        let nodeBio = $('.vcard').children().first();

        ////////////////
        ////
        ////  returning object
        ////

        let json = {};

        ////////////////
        ////
        ////  get schools
        ////

        let nodeSchool = findTwoDeep($, nodeBio, 'School');
        if (nodeSchool) {
          let schools = [];
          let children = nodeSchool.find('td').children();
          // case one: school infromation is displayed with <a> tags in <l1> tags
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
          // case two: school information is displayed simply with <a> tags
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

        ////////////////
        ////
        ////  get main interests
        ////

        let nodeInterests = findTwoDeep($, nodeBio, 'Main interests');
        if (nodeInterests) {
          let interests = [];
          let children = nodeInterests.find('td').children();
          if (!children.length) {
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


      }
    });
  });
});

const findTwoDeep = ($, node, criterion) => {
  let returnNode = 
    node
      .children()
      .filter(function(i, el) {
        return $(this).children().first().children().first().text() === criterion;
      });
  return returnNode;
}