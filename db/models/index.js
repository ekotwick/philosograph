'use strict';

const metaModels = {
      Urls: require('./Urls'),
      AllData: require('./AllData')
    }
    , {mapValues} = require('lodash');

module.exports = db => {

  const models = mapValues(metaModels, defineModel => defineModel(db));

  Object.keys(metaModels)
    .forEach(name => {
      const {associations} = metaModels[name];
      if (typeof associations === 'function') { 
        associations.call(metaModels[name], models[name], models);
      }
    })
  return models;
};
