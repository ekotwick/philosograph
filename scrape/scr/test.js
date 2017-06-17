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
  let href = node.attr('href');
  if (href.includes('#cite')) return false;
  return true;
}

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

