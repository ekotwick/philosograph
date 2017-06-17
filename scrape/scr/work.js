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
        let nodeWork = $('.biography').children().first();

        ////////////////
        ////
        ////  returning object
        ////

        let json = {};

        ////////////////
        ////
        ////  get schools
        ////

        let nodeSchool = findTwoDeep($, nodeWork, 'School');
        // if (notableIdeas.children().length) {
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

        let nodeInterests = findTwoDeep($, nodeWork, 'Main interests');
        // if (notableIdeas.children().length) {
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

        ////////////////
        ////
        ////  get notable ideas
        ////

        let notableIdeas = findTwoDeep($, nodeWork, 'Notable ideas');
        if (notableIdeas.children().length) {
          let ideas = [];
          let children = notableIdeas.find('td').children();
          if (!children.length) {
            console.log('\n\nhere\n\n')
            let idea = { name: '', href: '' };
            idea.name = notableIdeas.find('td').text();
            idea.href = notableIdeas.find('td').attr('href');
            ideas.push(idea);
          }
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let idea = { name: '', href: '' };
                idea.name = $(this).text();
                idea.href = $(this).attr('href');
                ideas.push(idea);
              });
          } else if (children.children().first().is('div')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let idea = { name: '', href: '' };
                idea.name = $(this).text();
                idea.href = $(this).attr('href');
                ideas.push(idea);
              });
          } else if (children.first().is('a')) {
            children
              .each(function(i, el){
                if ($(this).is('a')) {
                  let idea = { name: '', href: '' };
                  idea.name = $(this).text();
                  idea.href = $(this).attr('href');
                  ideas.push(idea);
                }
              });
          } else {
            children
              .find('a')
              .each(function(i, el){
                if ($(this).is('a')) {
                  let idea = { name: '', href: '' };
                  idea.name = $(this).text();
                  idea.href = $(this).attr('href');
                  ideas.push(idea);
                }
              });
          }
          json.notableIdeas = ideas;
        }

        ////////////////
        ////
        ////  get notable works
        ////

        let notableWorks = findTwoDeep($, nodeWork, 'Notable work');
        if (notableWorks.children().length) {
          let works = [];
          notableWorks
            .find('a')
            .each(function(i, el) {
              let work = $(this).text();
              works.push(work);
            });
          json.works = works;
        }

        ////////////////
        ////
        ////  get influences/influenced
        ////

        const nodeInfluence_S = 
          $('.NavHead')
            .filter(function(i, el) {
              return $(this).text() === 'Influences';
            });

        const nodeInfluence_D = 
          $('.NavHead')
            .filter(function(i, el) {
              return $(this).text() === 'Influenced';
            });

        let influences = [];
        if (nodeInfluence_S.siblings().length) {
          nodeInfluence_S
            .siblings()
            .find('a')
            .each(function(i, el) {
              let influence = { name: '', href: '' };
              influence.name = $(this).text();
              influence.href = $(this).attr('href');
              influences.push(influence);
            });

          json.influences = influences;
        }

        let influenced = [];
        if (nodeInfluence_D.siblings().length) {
          if (nodeInfluence_D.siblings().text().includes('Western')) {
            influenced.push('****');
          } else {
            nodeInfluence_D
              .siblings()
              .find('a')
              .each(function(i, el) {
                let influence = { name: '', href: '' };
                influence.name = $(this).text();
                influence.href = $(this).attr('href');
                influenced.push(influence);
              });
          }

          json.influenced = influenced;
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
};