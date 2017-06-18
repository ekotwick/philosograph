const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const _flow = require('lodash').flow;
const nationalities = require('./dataLists').nationalities;
const regions = require('./dataLists').regions;

const app = express();

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

                          // GOT BIOGRAPHICAL AND WORK INFORMATION

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/', (req, res, next) => {

  const urls = [
  // 'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
  // 'https://en.wikipedia.org/wiki/Parmenides',
  // 'https://en.wikipedia.org/wiki/Nancy_Cartwright_(philosopher)',
  // 'https://en.wikipedia.org/wiki/Thomas_Aquinas',
  // 'https://en.wikipedia.org/wiki/Aristotle',
  // 'https://en.wikipedia.org/wiki/Immanuel_Kant',
  // 'https://en.wikipedia.org/wiki/Augustine_of_Hippo',
  // 'https://en.wikipedia.org/wiki/Boethius',
  // 'https://en.wikipedia.org/wiki/Plato',
  // 'https://en.wikipedia.org/wiki/Socrates',
  // 'https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes'
  // 'https://en.wikipedia.org/wiki/Pierre_Jean_George_Cabanis',
  // 'https://en.wikipedia.org/wiki/Am%C3%ADlcar_Cabral',
  // 'https://en.wikipedia.org/wiki/Edward_Caird',
  // 'https://en.wikipedia.org/wiki/Thomas_Cajetan',
  // 'https://en.wikipedia.org/wiki/Calcidius',
  // 'https://en.wikipedia.org/wiki/John_Calvin',
  // 'https://en.wikipedia.org/wiki/Callicles',
  // 'https://en.wikipedia.org/wiki/Johannes_Clauberg',
  // 'https://en.wikipedia.org/wiki/Cleanthes',
  // 'https://en.wikipedia.org/wiki/Clement_of_Alexandria',
  // 'https://en.wikipedia.org/wiki/Catherine_Cl%C3%A9ment',
  // 'https://en.wikipedia.org/wiki/Cleomedes',
  // 'https://en.wikipedia.org/wiki/William_Kingdon_Clifford',
  // 'https://en.wikipedia.org/wiki/Catherine_Trotter_Cockburn',
  // 'https://en.wikipedia.org/wiki/Lorraine_Code',
  // 'https://en.wikipedia.org/wiki/Gerald_Cohen',
  // 'https://en.wikipedia.org/wiki/Hermann_Cohen',
  // 'https://en.wikipedia.org/wiki/L._Jonathan_Cohen',
  // 'https://en.wikipedia.org/wiki/Morris_Raphael_Cohen',
  // 'https://en.wikipedia.org/wiki/Samuel_Taylor_Coleridge',
  // 'https://en.wikipedia.org/wiki/John_Colet',
  // 'https://en.wikipedia.org/wiki/Lucio_Colletti',
  // 'https://en.wikipedia.org/wiki/Arthur_Collier',
  // 'https://en.wikipedia.org/wiki/R._G._Collingwood',
  // 'https://en.wikipedia.org/wiki/Anthony_Collins',
  // 'https://en.wikipedia.org/wiki/Comenius',
    // 'https://en.wikipedia.org/wiki/Lady_Anne_Finch_Conway',
    // 'https://en.wikipedia.org/wiki/Nicolaus_Copernicus',
    // 'https://en.wikipedia.org/wiki/Henry_Corbin',
    // 'https://en.wikipedia.org/wiki/Victor_Cousin',
    // 'https://en.wikipedia.org/wiki/Benedetto_Croce',
    // 'https://en.wikipedia.org/wiki/Cyrano_de_Bergerac_(writer)',
    // 'https://en.wikipedia.org/wiki/Franz_Xaver_von_Baader',
    // 'https://en.wikipedia.org/wiki/Francis_Bacon',
    // 'https://en.wikipedia.org/wiki/Hibat_Allah_Abu%27l-Barakat_al-Baghdaadi',
    // 'https://en.wikipedia.org/wiki/Mikhail_Bakunin',
    // 'https://en.wikipedia.org/wiki/Roland_Barthes',
    // 'https://en.wikipedia.org/wiki/Georges_Bataille',
    // 'https://en.wikipedia.org/wiki/Alexander_Gottlieb_Baumgarten',
    // 'https://en.wikipedia.org/wiki/Nuel_Belnap',
    // 'https://en.wikipedia.org/wiki/Jonathan_Bennett_(philosopher)',
    // 'https://en.wikipedia.org/wiki/George_Berkeley',
    // 'https://en.wikipedia.org/wiki/Bernard_Silvestris',
    // 'https://en.wikipedia.org/wiki/Ludwig_von_Bertalanffy',
    'https://en.wikipedia.org/wiki/Simon_Blackburn',
    'https://en.wikipedia.org/wiki/Blasius_of_Parma',
    'https://en.wikipedia.org/wiki/Norberto_Bobbio',
    'https://en.wikipedia.org/wiki/Jakob_B%C3%B6hme',
    'https://en.wikipedia.org/wiki/Henry_St_John,_1st_Viscount_Bolingbroke',
    'https://en.wikipedia.org/wiki/Bonaventure',
    'https://en.wikipedia.org/wiki/Rudjer_Boscovich',
    'https://en.wikipedia.org/wiki/Henri_de_Boulainvilliers',
    'https://en.wikipedia.org/wiki/Robert_Boyle',
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
        let nodeBio = $('.vcard').children().first();
        
        let json = {};
        let bio = {};
        let bioNodes = {};

        ////////////////
        ////
        ////  get name
        ////

        let nodeName = $('#firstHeading').text();
        let name = trimParens(nodeName).trim();
        bio.name = name;

        ////////////////
        ////
        ////  get birth details
        ////

        let nodeBorn = findOneDeep($, nodeBio, 'Born');
        let hasBornNode;
        if (nodeBorn.children().length) {
          bioNodes.hasBornNode = true;
          let birthData = nodeBorn.children().first().next().text().split('\n');
          let birthDateIndex; 
          let birthDate;
          const d = /\d/;
          for (let i = 0; i < birthData.length; i++) {
            if (d.test(birthData[i])) {
              birthDate = birthData[i];
              birthDateIndex = i;
              break;
            }
          }
          bio.birthDate = getYear(birthDate);
          let locSpecific, locGeneral;
          let locations = birthData.slice(birthDateIndex + 1);
          if (locations.length > 1) {
            locSpecific = locations[0];
            locGeneral = locations.slice(-1);
            let birthPlace = `${locSpecific} ${locGeneral}`;
            bio.birthPlace = trimParens(birthPlace);
          } else {
            let birthPlace = locations[0];
            bio.birthPlace = trimParens(birthPlace);
          }
        } else {
          bioNodes.hasBornNode = false;
        }

        ////////////////
        ////
        ////  get death
        ////

        let nodeDeath = findOneDeep($, nodeBio, 'Died');
        let hasDeathNode;
        if (nodeDeath.children().length) {
          bioNodes.hasDeathNode = true;
          let deathData = nodeDeath.children().first().next().text().split('\n');
          let deathDate;
          const d = /\d/;
          for (let i = 0; i < deathData.length; i++) {
            if (d.test(deathData[i])) {
              deathDate = deathData[i];
              break;
            }
          }
          bio.deathDate = getYear(deathDate);
        } else {
          bioNodes.hasDeathNode = false;
        }

        // the following three if cases: if there is a .vcard, but not the needed biographical data, search the bottom links for alteratives;
        let bottomLinks = $('#catlinks').children().first();
        const d = /\d/;
        if (!bio.birthDate) {
          let birthData =
            bottomLinks
              .find('a')
              .filter(function(i, el) {
                return $(this).text().includes('births');
              })
              .text()
              .split(' ');
          let birthDate;
          for (let i = 0; i < birthData.length; i++) {
            if(d.test(birthData[i])) {
              birthDate = birthData[i];
              break;
            }
          }
          bio.birthDate = birthDate;
        }

        if (!bio.birthPlace) {
          let possibleCountries = [];
          let notFound = true;
          let nationality;
          bottomLinks 
            .find('a')
            .filter(function(i, el) {
              return $(this).text().toLowerCase().includes('philosophers');
            })
            .each(function(i, el) {
              let kindOfPhilosopher = $(this).text().toLowerCase().split(' ')[0];
              possibleCountries.push(kindOfPhilosopher);
            });
          for (let i = 0; i < possibleCountries.length; i++) {
            if (nationalities[possibleCountries[i]]) {
              nationality = nationalities[possibleCountries[i]];
              notFound = false;
              break;
            }
          }
          if (notFound) {
            for (let i = 0; i < possibleCountries.length; i++) {
              if (regions[possibleCountries[i]]) {
                nationality = regions[possibleCountries[i]];
                notFound = false;
                break;
              }
            }
          }
          if (notFound) {
            let allText = [];
            bottomLinks
              .find('a')
              .each(function(i, el) {
                let currText = $(this).text().toLowerCase().split(' ');
                allText += currText + ',';
              })
            possibleCountries = allText.split(',');
            for (let i = 0; i < possibleCountries.length; i++) {
              if (nationalities[possibleCountries[i]]) {
                nationality = nationalities[possibleCountries[i]];
                notFound = false;
                break;
              }
            }
          }
          bio.birthPlace = nationality;
        }
        
        if (!bio.deathDate) {
          let deathData =
            bottomLinks
              .find('a')
              .filter(function(i, el) {
                return $(this).text().includes('death');
              })
              .text()
              .split(' ');
          let deathDate;
          for (let i = 0; i < deathData.length; i++) {
            if(d.test(deathData[i])) {
              deathDate = deathData[i];
              break;
            }
          }
          bio.deathDate = deathDate;
        }




        json.bioNodes = bioNodes;
        json.bio = bio;

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
          json.hasSchoolNode = false;
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

const trimParens = (str) => {
  let result = '';
  let inParens = false;
  for (let i = 0; i < str.length; i++) {
    let s = str[i];
    if (inParens) { // if we are not in parentheses
      if (s === ')' || s === ']') {
        inParens = false;
        continue;
      } else {
        continue;
      }
    }
    else { // if we are in parentheses
      if (s === '(' || s === '[') {
        inParens = true;
        continue;
      } else {
        result += s;
      }
    }
  }
  return result;
};

const getYearOnly = (str) => {
  let split = str.trim().split(' ');
  if (str.includes('or')) return str.split(' or ').slice(-1).join().trim(); // imprecise date, e.g., '455 or 451'
  if (split[0].includes('c')) return split.slice(1).join(' '); // imprecise date, e.g., 'c. 420 BC'
  if (split.length > 2) return split.slice(-1).join(); // overly precise date, e.g., '12 April 1845'
  return str;
};

const findOneDeep = ($, node, criterion) => {
  let returnNode = 
    node
      .children()
      .filter(function(i, el) {
        let titleNode = $(this).children().first();
        return titleNode.text() === criterion;
      });
  return returnNode;
};

const getYear = _flow([trimParens, getYearOnly]);

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


app.listen(3000, () => { console.log('listening on port 3000')});


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

                                        // GOT BIOGRAPHICAL INFORMATION

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// app.get('/', (req, res, next) => {

//   const urls = [
//   'https://en.wikipedia.org/wiki/Aristotle',
//   'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
//   'https://en.wikipedia.org/wiki/Parmenides',
//   'https://en.wikipedia.org/wiki/Nancy_Cartwright_(philosopher)',
//   'https://en.wikipedia.org/wiki/Thomas_Aquinas'
//   ];

//   urls.forEach(url => {
//     request(url, (err, res, html) => {
//       if (err) console.log(err);
//       else {
//         console.log('\n\n', url)

//         let $ = cheerio.load(html);
//         let json = {}

//         let bio = {};
//         let bioNodes = {};
//         let nodeBio = $('.vcard').children().first();

//         ////////////////
//         ////
//         ////  get name
//         ////

//         let nodeName = 
//           nodeBio
//             .find($('.fn'));
//         let name = nodeName.text();
//         bio.name = name;

//         ////////////////
//         ////
//         ////  get birth details
//         ////

//         let nodeBorn = findByFilter($, nodeBio, 'Born');
//         let hasBornNode;
//         if (nodeBorn.children().length) {
//           bioNodes.hasBornNode = true;
//           let birthData = nodeBorn.children().first().next().text().split('\n');
//           let birthDateIndex; 
//           let birthDate;
//           const d = /\d/;
//           for (let i = 0; i < birthData.length; i++) {
//             if (d.test(birthData[i])) {
//               birthDate = birthData[i];
//               birthDateIndex = i;
//               break;
//             }
//           }
//           bio.birthDate = getYearOnly(trimParens(birthDate));
//           let locSpecific, locGeneral;
//           let locations = birthData.slice(birthDateIndex + 1);
//           if (locations.length > 1) {
//             locSpecific = locations[0];
//             locGeneral = locations.slice(-1);
//             bio.birthPlace = `${locSpecific} ${locGeneral}`;
//           } else {
//             bio.birthPlace = locations[0];
//           }
//         } else {
//           bioNodes.hasBornNode = false;
//         }

//         ////////////////
//         ////
//         ////  get death
//         ////

//         let nodeDeath = findByFilter($, nodeBio, 'Died');
//         let hasDeathNode;
//         if (nodeDeath.children().length) {
//           bioNodes.hasDeathNode = true;
//           let deathData = nodeDeath.children().first().next().text().split('\n');
//           let deathDate;
//           const d = /\d/;
//           for (let i = 0; i < deathData.length; i++) {
//             if (d.test(deathData[i])) {
//               deathDate = deathData[i];
//               break;
//             }
//           }
//           bio.deathDate = getYearOnly(trimParens(deathDate));
//         } else {
//           bioNodes.hasDeathNode = false;
//         }

//         json.bioNodes = bioNodes;
//         json.bio = bio;

//         console.log(JSON.stringify(json, null, 5));

//       }
//     });
//   });
// });

// app.listen(3000, () => { console.log('listening on port 3000')});

// module.exports = { app }

// const trimParens = (str) => {
//   console.log(str);
//   let result = '';
//   let inParens = false;
//   for (let i = 0; i < str.length; i++) {
//     let s = str[i];
//     if (inParens) { // if we are not in parentheses
//       if (s === ')' || s === ']') {
//         inParens = false;
//         continue;
//       } else {
//         continue;
//       }
//     }
//     else { // if we are in parentheses
//       if (s === '(' || s === '[') {
//         inParens = true;
//         continue;
//       } else {
//         result += s;
//       }
//     }
//   }
//   return result;
// };

// const getYearOnly = (str) => {
//   if (str.trim().split(' ').length > 2) return str.trim().split(' ').slice(-1).join();
//   return str;
// };

// // const findByFilter = ($, node, criterion) => {
// //   let returnNode = 
// //     node
// //       .children()
// //       .filter(function(i, el) {
// //         $(this)
// //       })
// // }

// const findByFilter = ($, node, criterion) => {
//   let returnNode = 
//     // let th = node.find('tr').children().first();
//     // if (th.children().first().is('div')) return th.children().first().text();
//     // else return 
//       // .find('th')
//       // .filter(function(i, el) {
//       //   return $(this).text() === criterion;
//       // })
//     node
//       .children()
//       .filter(function(i, el) {
//         let titleNode = $(this).children().first();
//         return titleNode.text() === criterion;
//       });
//   return returnNode;
// }

// const findByFilterSchool = ($, node, criterion) => {
//   let returnNode = 
//     node
//       .children()
//       .filter(function(i, el) {
//         return $(this).children().first().children().first().text() === criterion;
//       });
//   return returnNode;
// }

// const getItems = ($, node) => {
//   let ul = node.find('ul');
//   if (!ul) return node.text();
//   else {
//     let returnData = []
//     ul
//       .find('li')
//       .each(function(i, el) {
//         returnData.push($(this).text());
//       });
//     return returnData;
//   }
// }


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

                                        // GOT WORK INFORMATION

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// app.get('/', (req, res, next) => {

//   const urls = [
//   'https://en.wikipedia.org/wiki/Aristotle',
//   'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
//   'https://en.wikipedia.org/wiki/Parmenides',
//   'https://en.wikipedia.org/wiki/Nancy_Cartwright_(philosopher)',
//   'https://en.wikipedia.org/wiki/Thomas_Aquinas'
//   ];

//   urls.forEach(url => {
//     request(url, (err, res, html) => {
//       if (err) console.log(err);
//       else {

//         console.log('\n\n', url.split('/').slice(-1).join(''))
//         ////////////////
//         ////
//         ////  starting object
//         ////

//         let $ = cheerio.load(html);
//         let nodeWork = $('.biography').children().first();

//         ////////////////
//         ////
//         ////  returning object
//         ////

//         let json = {};

//         ////////////////
//         ////
//         ////  get schools
//         ////

//         let nodeSchool = findTwoDeep($, nodeWork, 'School');
//         if (nodeSchool.children().length) {
//           json.hasSchoolNode = true;
//           let schools = [];
//           let children = nodeSchool.find('td').children();
//           // case one: school infromation is displayed with <a> tags in <l1> tags
//           if (children.children().first().is('ul')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                   let node = $(this);
//                   if (isNotANote(node)) schools.push(createDataObj(node));
//               });
//           // case two: school information is displayed simply with <a> tags
//           } else {
//             children
//               .each(function(i, el){
//                 if (!$(this).is('br')) {
//                   let node = $(this);
//                   if (isNotANote(node)) schools.push(createDataObj(node));
//                 }
//               });
//           }
//           json.schools = schools;
//         } else {
//           jsdon.hasSchoolNode = false;
//         }

//         ////////////////
//         ////
//         ////  get main interests
//         ////

//         let nodeInterests = findTwoDeep($, nodeWork, 'Main interests');
//         if (nodeInterests.children().length) {
//           json.hasInterestNode = true;
//           let interests = [];
//           let children = nodeInterests.find('td').children();
//           if (!children.length) {
//             let node = nodeInterests.find('td');
//             interests.push(createDataObj(node));
//           }
//           if (children.children().first().is('ul')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let node = $(this);
//                 if (isNotANote(node)) interests.push(createDataObj(node));
//               });
//           } else if (children.children().first().is('div')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let node = $(this);
//                 if (isNotANote(node)) interests.push(createDataObj(node));
//               });
//           } else {
//             children
//               .each(function(i, el){
//                 if (!$(this).is('br')) {
//                   let node = $(this);
//                   if (isNotANote(node)) interests.push(createDataObj(node));
//                 }
//               });
//           }
//           json.mainInterests = interests;
//         } else {
//           json.hasInterestNode = false;
//         }

//         ////////////////
//         ////
//         ////  get notable ideas
//         ////

//         let notableIdeas = findTwoDeep($, nodeWork, 'Notable ideas');
//         if (notableIdeas.children().length) {
//           json.hasIdeaNode = true;
//           let ideas = [];
//           let children = notableIdeas.find('td').children();
//           if (!children.length) {
//             let node = notableIdeas.find('td');
//           if (isNotANote(node)) ideas.push(createDataObj(node));
//           }
//           if (children.children().first().is('ul')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let node = $(this);
//                 if (isNotANote(node)) ideas.push(createDataObj(node));
//               });
//           } else if (children.children().first().is('div')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                   let node = $(this);
//                   if (isNotANote(node)) ideas.push(createDataObj(node));
//               });
//           } else if (children.first().is('a')) {
//             children
//               .each(function(i, el){
//                 if ($(this).is('a')) {
//                   let node = $(this);
//                   if (isNotANote(node)) ideas.push(createDataObj(node));
//                 }
//               });
//           } else {
//             children
//               .find('a')
//               .each(function(i, el){
//                 if ($(this).is('a')) {
//                   let node = $(this);
//                   if (isNotANote(node)) ideas.push(createDataObj(node));
//                 }
//               });
//           }
//           json.notableIdeas = ideas;
//         } else {
//           json.hasIdeaNode = false;
//         }

//         ////////////////
//         ////
//         ////  get notable works
//         ////

//         let notableWorks = findTwoDeep($, nodeWork, 'Notable work');
//         if (notableWorks.children().length) {
//           json.hasWorkNode = true;
//           let works = [];
//           notableWorks
//             .find('a')
//             .each(function(i, el) {
//               let node = $(this);
//               if (isNotANote(node)) works.push(createDataObj(node));
//             });
//           json.works = works;
//         } else {
//           json.hasWorkNode = false;
//         }

//         ////////////////
//         ////
//         ////  get influences/influenced
//         ////

//         const nodeInfluence_S = 
//           $('.NavHead')
//             .filter(function(i, el) {
//               return $(this).text() === 'Influences';
//             })
//             .siblings();

//         const nodeInfluence_D = 
//           $('.NavHead')
//             .filter(function(i, el) {
//               return $(this).text() === 'Influenced';
//             })
//             .siblings();

//         let influences = [];
//         if (nodeInfluence_S.length) {
//           json.hasInfluence_s_Node = true;
//           nodeInfluence_S
//             .find('a')
//             .each(function(i, el) {
//                 let node = $(this);
//                 if (isNotANote(node)) influences.push(createDataObj(node));
//             });

//           json.influences = influences;
//         } else {
//           json.hasInfluence_s_Node = false;
//         }

//         let influenced = [];
//         if (nodeInfluence_D.length) {
//           json.hasInfluence_d_node = true;
//           let influencedList = nodeInfluence_D.text();
//           if (isBigInfluencer(influencedList)) {
//             influenced.push('****');
//           } else {
//             nodeInfluence_D
//               .find('a')
//               .each(function(i, el) {
//                 let node = $(this);
//                 if (isNotANote(node)) influenced.push(createDataObj(node));
//               });
//           } 

//           json.influenced = influenced;
//         } else {
//           json.hasInfluence_d_node = false;
//         }


//         console.log(JSON.stringify(json, null, 5));
//       }
//     });
//   });
// });

// const isNotANote = (node) => {
//   let href = node.attr('href');
//   if (href.includes('#cite')) return false;
//   return true;
// }

// const isBigInfluencer = (list) => {
//   const regions = ['Western', 'Eastern', 'Indian', 'Chinese', 'Modern', 'Medieval', 'all', 'All'];
//   for (let i = 0; i < regions.length; i++) {
//     if (list.includes(regions[i])) return true;
//   }
//   return false;
// };

// const createDataObj = (node) => {
//   let obj = { name: '', href: '' };
//   obj.name = node.text();
//   obj.href = node.attr('href');
//   return obj;
// };

// const findTwoDeep = ($, node, criterion) => {
//   let returnNode = 
//     node
//       .children()
//       .filter(function(i, el) {
//         return $(this).children().first().children().first().text() === criterion;
//       });
//   return returnNode;
// };


// app.listen(3000, () => { console.log('listening on port 3000')});


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

                                        // GOT BASIC FUNCTIONALITY

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

// app.get('/', (req, res, next) => {

//   const urls = [
//   'https://en.wikipedia.org/wiki/Aristotle',
//   'https://en.wikipedia.org/wiki/Ludwig_Wittgenstein',
//   // 'https://en.wikipedia.org/wiki/Parmenides',
//   'https://en.wikipedia.org/wiki/Nancy_Cartwright_(philosopher)',
//   'https://en.wikipedia.org/wiki/Thomas_Aquinas'
//   ];

//   urls.forEach(url => {
//     request(url, (err, res, html) => {
//       if (err) console.log(err);
//       else {
//         let $ = cheerio.load(html);
//         let json = {}

//         let bio = {};
//         let nodeBio = $('.biography').children().first();
//         // get name
//         let nodeName = 
//           nodeBio
//             .find($('.fn'));
//         let name = nodeName.text();
//         bio.name = name;
//         console.log('\n\n', url)
//         // get lifetime data
//         // birth
//         let nodeBorn = findByFilter($, nodeBio, 'Born');
//         if (nodeBorn) {
//           // console.log('\n BORN \n')
//           nodeBorn = nodeBorn.children().first().next();
//           let birthDate = nodeBorn.text();
//           bio.birthDate = birthDate;
//           // if birthplace
//           let nodeBirthPlace = nodeBorn.find($('.birthplace'));
//           if (nodeBirthPlace) {
//             let birthPlace = nodeBirthPlace.text();
//             bio.birthPlace = birthPlace;
//           }
//         }
//         // death
//         let nodeDeath = findByFilter($, nodeBio, 'Died');
//         if (nodeDeath) {
//           // console.log('\n DIED \n')
//           nodeDeath = nodeDeath.children().first().next();
//           let deathDate = nodeDeath.text();
//           bio.deathDate = deathDate;
//         }

//         json.bio = bio;

//         // get school
//         let nodeSchool = findByFilterSchool($, nodeBio, 'School');
//         if (nodeSchool) {
//           let schools = [];
//           let children = nodeSchool.find('td').children();
//           if (children.children().first().is('ul')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let school = { name: '', href: '' };
//                 school.name = $(this).text();
//                 school.href = $(this).attr('href');
//                 schools.push(school);
//               });
//           } else if (children.children().first().is('div')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let school = { name: '', href: '' };
//                 school.name = $(this).text();
//                 school.href = $(this).attr('href');
//                 schools.push(school);
//               });
//           } else {
//             children
//               .each(function(i, el){
//                 if (!$(this).is('br')) {
//                   let school = { name: '', href: '' };
//                   school.name = $(this).text();
//                   school.href = $(this).attr('href');
//                   schools.push(school);
//                 }
//               });
//           }
//           json.schools = schools;
//         }
//         // if (nodeSchool) {
//         //   // console.log('\n SCHOOL \n')
//         //   let schools = getItems($, nodeSchool);
//         //   json.school = schools;
//         // }

//         // get interestes
//         let nodeInterests = findByFilterSchool($, nodeBio, 'Main interests');
//         if (nodeInterests) {
//           // console.log(nodeInterests)
//           let interests = [];
//           let children = nodeInterests.find('td').children();
//           // this checks for the case where the information is stated directly within <td> tags
//           if (!children.length) {
//             console.log('\n\nhere\n\n')
//             let interest = { name: '', href: '' };
//             interest.name = nodeInterests.find('td').text();
//             interest.href = nodeInterests.find('td').attr('href');
//             interests.push(interest);
//           }
//           if (children.children().first().is('ul')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let interest = { name: '', href: '' };
//                 interest.name = $(this).text();
//                 interest.href = $(this).attr('href');
//                 interests.push(interest);
//               });
//           } else if (children.children().first().is('div')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let interest = { name: '', href: '' };
//                 interest.name = $(this).text();
//                 interest.href = $(this).attr('href');
//                 interests.push(interest);
//               });
//           } else {
//             children
//               .each(function(i, el){
//                 if (!$(this).is('br')) {
//                   let interest = { name: '', href: '' };
//                   interest.name = $(this).text();
//                   interest.href = $(this).attr('href');
//                   interests.push(interest);
//                 }
//               });
//           }
//           json.mainInterests = interests;
//         }

//         // get notable ideas
//         let notableIdeas = findByFilterSchool($, nodeBio, 'Notable ideas');
//         // this checks whether there exists such a node;
//         if (notableIdeas.children().length) {
//           // console.log(nodeInterests)
//           let ideas = [];
//           let children = notableIdeas.find('td').children();
//           if (!children.length) {
//             console.log('\n\nhere\n\n')
//             let idea = { name: '', href: '' };
//             idea.name = notableIdeas.find('td').text();
//             idea.href = notableIdeas.find('td').attr('href');
//             ideas.push(idea);
//           }
//           // this is to check the cases where the information is placed directly in the <tr> tag, but there are stupid as children in there as well, but which don't carry any information
//           // if (children.find('div').length === 0 && children.find('ul').length ===0) {
//           // console.log('<———————————————', url, '———————————————>')
//           //   let idea = { name: '', href: '' };
//           //   idea.name = notableIdeas.find('td').text();
//           //   idea.href = notableIdeas.find('td').attr('href');
//           //   ideas.push(idea);
//           // }
//           if (children.children().first().is('ul')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let idea = { name: '', href: '' };
//                 idea.name = $(this).text();
//                 idea.href = $(this).attr('href');
//                 ideas.push(idea);
//               });
//           } else if (children.children().first().is('div')) {
//             children
//               .find('li')
//               .children()
//               .each(function(i, el){
//                 let idea = { name: '', href: '' };
//                 idea.name = $(this).text();
//                 idea.href = $(this).attr('href');
//                 ideas.push(idea);
//               });
//           } else if (children.first().is('a')) {
//             children
//               .each(function(i, el){
//                 if ($(this).is('a')) {
//                   let idea = { name: '', href: '' };
//                   idea.name = $(this).text();
//                   idea.href = $(this).attr('href');
//                   ideas.push(idea);
//                 }
//               });
//           } else {
//             children
//               .find('a')
//               .each(function(i, el){
//                 if ($(this).is('a')) {
//                   let idea = { name: '', href: '' };
//                   idea.name = $(this).text();
//                   idea.href = $(this).attr('href');
//                   ideas.push(idea);
//                 }
//                 // if (!$(this).is('br') && !$(this).is('sup')) {
//                   // let idea = { name: '', href: '' };
//                   // idea.name = $(this).text();
//                   // idea.href = $(this).attr('href');
//                   // ideas.push(idea);
//                 // }
//               });
//           }
//           json.notableIdeas = ideas;
//         }

//         // get notable works
//         let notableWorks = findByFilterSchool($, nodeBio, 'Notable work');
//         if (notableWorks.children().length) {
//           let works = [];
//           notableWorks
//             .find('a')
//             .each(function(i, el) {
//               let work = $(this).text();
//               works.push(work);
//             });
//           json.works = works;
//         }

//         const nodeInfluence_S = 
//           $('.NavHead')
//             .filter(function(i, el) {
//               return $(this).text() === 'Influences';
//             });

//         const nodeInfluence_D = 
//           $('.NavHead')
//             .filter(function(i, el) {
//               return $(this).text() === 'Influenced';
//             });

//         let influences = [];
//         if (nodeInfluence_S.siblings().length) {
//           nodeInfluence_S
//             .siblings()
//             .find('a')
//             .each(function(i, el) {
//               let influence = { name: '', href: '' };
//               influence.name = $(this).text();
//               influence.href = $(this).attr('href');
//               influences.push(influence);
//             });

//           json.influences = influences;
//         }

//         let influenced = [];
//         if (nodeInfluence_D.siblings().length) {
//           if (nodeInfluence_D.siblings().text().includes('Western')) {
//             influenced.push('****');
//           } else {
//             nodeInfluence_D
//               .siblings()
//               .find('a')
//               .each(function(i, el) {
//                 let influence = { name: '', href: '' };
//                 influence.name = $(this).text();
//                 influence.href = $(this).attr('href');
//                 influenced.push(influence);
//               });
//           }

//           json.influenced = influenced;
//         }

//         // // get influences 
//         // let drewFrom = findByFilter($, nodeBio, 'Influences');
//         // if (drewFrom) {
//         //   // console.log('\n INFLUENCES \n')
//         //   let influences = getItems($, drewFrom);
//         //   json.drewFrom = influences;
//         // }

//         // // get influenced
//         // let influenced = findByFilter($, nodeBio, 'Influenced');
//         // if (influenced) {
//         //   // console.log('\n INFLUENCED \n')
//         //   let followers = getItems($, influenced);
//         //   json.influenced = followers;
//         // }

//         console.log(JSON.stringify(json, null, 5));

//       }
//     });
//   });
// });

// app.listen(3000, () => { console.log('listening on port 3000')});

// module.exports = { app }

// // const findByFilter = ($, node, criterion) => {
// //   let returnNode = 
// //     node
// //       .children()
// //       .filter(function(i, el) {
// //         $(this)
// //       })
// // }

// const findByFilter = ($, node, criterion) => {
//   let returnNode = 
//     // let th = node.find('tr').children().first();
//     // if (th.children().first().is('div')) return th.children().first().text();
//     // else return 
//       // .find('th')
//       // .filter(function(i, el) {
//       //   return $(this).text() === criterion;
//       // })
//     node
//       .children()
//       .filter(function(i, el) {
//         let titleNode = $(this).children().first();
//         return titleNode.text() === criterion;
//       });
//   return returnNode;
// }

// const findByFilterSchool = ($, node, criterion) => {
//   let returnNode = 
//     node
//       .children()
//       .filter(function(i, el) {
//         return $(this).children().first().children().first().text() === criterion;
//       });
//   return returnNode;
// }

// const getItems = ($, node) => {
//   let ul = node.find('ul');
//   if (!ul) return node.text();
//   else {
//     let returnData = []
//     ul
//       .find('li')
//       .each(function(i, el) {
//         returnData.push($(this).text());
//       });
//     return returnData;
//   }
// }


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

                                        // FIRST ATTEMPT

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////


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

