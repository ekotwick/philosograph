// call all urls from db; there will be repition; filter them out with first IIFE
let arrWithRepeats = [];

// call all names from db; it's possible for multiple urls to call the same philosopher; filter them by ensuring that
// the urls match the same name (it's also possible that multiple philosophers have the same name; we run this risk);
let arrayOfNames;

let arrayOfUrls = [];

(function() {
  let obj = {};
  arrWithRepeats.forEach(el => {
    obj[el] = obj[el] || 1;
  });
  arrayOfUrls = Object.keys(obj);
})();

// creates a partition;
let indices = [];

(function() {
  let count = 1;
  let currSet = [];
  for (let i = 0; i < arrayOfUrls.length; i++) {
    currSet.push(i);
    count++;
    if (count > 25) {
      indices.push(currSet);
      currSet = [];
      count = 0;
    }
    if (i === arrayOfUrls.length - 1) {
      indices.push(currSet);
    }
  }
})();

module.exports = { arrayOfUrls, indices, arrayOfNames }