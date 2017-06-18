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

        console.log('\n\n', url.split('/').slice(-1).join(''))
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
        if (nodeSchool.children().length) {
          json.hasSchoolNode = true;
          let schools = [];
          let children = nodeSchool.find('td').children();
          // case one: school infromation is displayed with <a> tags in <l1> tags
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                  let node = $(this);
                  if (isNotANote(node)) schools.push(createDataObj(node));
              });
          // case two: school information is displayed simply with <a> tags
          } else {
            children
              .each(function(i, el){
                if (!$(this).is('br')) {
                  let node = $(this);
                  if (isNotANote(node)) schools.push(createDataObj(node));
                }
              });
          }
          json.schools = schools;
        } else {
          jsdon.hasSchoolNode = false;
        }

        ////////////////
        ////
        ////  get main interests
        ////

        let nodeInterests = findTwoDeep($, nodeWork, 'Main interests');
        if (nodeInterests.children().length) {
          json.hasInterestNode = true;
          let interests = [];
          let children = nodeInterests.find('td').children();
          if (!children.length) {
            let node = nodeInterests.find('td');
            interests.push(createDataObj(node));
          }
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let node = $(this);
                if (isNotANote(node)) interests.push(createDataObj(node));
              });
          } else if (children.children().first().is('div')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let node = $(this);
                if (isNotANote(node)) interests.push(createDataObj(node));
              });
          } else {
            children
              .each(function(i, el){
                if (!$(this).is('br')) {
                  let node = $(this);
                  if (isNotANote(node)) interests.push(createDataObj(node));
                }
              });
          }
          json.mainInterests = interests;
        } else {
          json.hasInterestNode = false;
        }

        ////////////////
        ////
        ////  get notable ideas
        ////

        let notableIdeas = findTwoDeep($, nodeWork, 'Notable ideas');
        if (notableIdeas.children().length) {
          json.hasIdeaNode = true;
          let ideas = [];
          let children = notableIdeas.find('td').children();
          if (!children.length) {
            let node = notableIdeas.find('td');
            if (isNotANote(node)) ideas.push(createDataObj(node));
          }
          if (children.children().first().is('ul')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                let node = $(this);
                if (isNotANote(node)) ideas.push(createDataObj(node));
              });
          } else if (children.children().first().is('div')) {
            children
              .find('li')
              .children()
              .each(function(i, el){
                  let node = $(this);
                  if (isNotANote(node)) ideas.push(createDataObj(node));
              });
          } else if (children.first().is('a')) {
            children
              .each(function(i, el){
                if ($(this).is('a')) {
                  let node = $(this);
                  if (isNotANote(node)) ideas.push(createDataObj(node));
                }
              });
          } else {
            children
              .find('a')
              .each(function(i, el){
                if ($(this).is('a')) {
                  let node = $(this);
                  if (isNotANote(node)) ideas.push(createDataObj(node));
                }
              });
          }
          json.notableIdeas = ideas;
        } else {
          json.hasIdeaNode = false;
        }

        ////////////////
        ////
        ////  get notable works
        ////

        let notableWorks = findTwoDeep($, nodeWork, 'Notable work');
        if (notableWorks.children().length) {
          json.hasWorkNode = true;
          let works = [];
          notableWorks
            .find('a')
            .each(function(i, el) {
              let node = $(this);
              if (isNotANote(node)) works.push(createDataObj(node));
            });
          json.works = works;
        } else {
          json.hasWorkNode = false;
        }

        ////////////////
        ////
        ////  get influences/influenced
        ////

        const nodeInfluence_S = 
          $('.NavHead')
            .filter(function(i, el) {
              return $(this).text() === 'Influences';
            })
            .siblings();

        const nodeInfluence_D = 
          $('.NavHead')
            .filter(function(i, el) {
              return $(this).text() === 'Influenced';
            })
            .siblings();

        let influences = [];
        if (nodeInfluence_S.length) {
          json.hasInfluence_s_Node = true;
          nodeInfluence_S
            .find('a')
            .each(function(i, el) {
                let node = $(this);
                if (isNotANote(node)) influences.push(createDataObj(node));
            });

          json.influences = influences;
        } else {
          json.hasInfluence_s_Node = false;
        }

        let influenced = [];
        if (nodeInfluence_D.length) {
          json.hasInfluence_d_node = true;
          let influencedList = nodeInfluence_D.text();
          if (isBigInfluencer(influencedList)) {
            influenced.push('****');
          } else {
            nodeInfluence_D
              .find('a')
              .each(function(i, el) {
                let node = $(this);
                if (isNotANote(node)) influenced.push(createDataObj(node));
              });
          } 

          json.influenced = influenced;
        } else {
          json.hasInfluence_d_node = false;
        }


        console.log(JSON.stringify(json, null, 5));
      }
    });
  });
});

const isNotANote = (node) => {
  let href = node.attr('href') && node.attr('href').includes('#cite');
  let text = node.text() && node.text().includes('[');
  if (href || text) return false;
  return true;
};

const isBigInfluencer = (list) => {
  const regions = ['Western', 'Eastern', 'Indian', 'Chinese', 'Modern', 'Medieval', 'all', 'All'];
  for (let i = 0; i < regions.length; i++) {
    if (list.includes(regions[i])) return true;
  }
  return false;
};

const createDataObj = (node) => {
  let obj = { name: '', href: '' };
  obj.name = node.text();
  obj.href = node.attr('href');
  return obj;
};

const findTwoDeep = ($, node, criterion) => {
  let returnNode = 
    node
      .children()
      .filter(function(i, el) {
        return $(this).children().first().children().first().text() === criterion;
      });
  return returnNode;
};