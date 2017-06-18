'use strict';

const { STRING, ARRAY, BOOLEAN, HSTORE } = require('sequelize');

module.exports = db => db.define('all_data', {
  url: { 
    type: STRING 
  },
  name: { 
    type: STRING 
  },
  birth_date: { 
    type: STRING 
  },
  residency: { 
    type: STRING,
    set: function(str) {
      let trimmed = str.trim();
      let split = trimmed.split(',');
      if (split.length > 2) {
        let toSet = `${split[0]}, ${split.slice(-1)}`;
        this.setDataValue('residency', toSet);
      } else {
        this.setDataValue('residency', str);
      }
    } 
  },
  death_date: { 
    type: STRING 
  },
  school_node: { 
    type: BOOLEAN 
  },
  schools: { 
    type: ARRAY(STRING),
    get: function() {
      let toReturn = this.getDataValue('schools').split('|');
      return { name: toReturn[0], url: toReturn[1] };
    } 
  },
  interest_node: { 
    type: BOOLEAN 
  },
  main_interests: { 
    type: ARRAY(STRING),
    get: function() {
      let toReturn = this.getDataValue('main_interests').split('|');
      return { interest: toReturn[0], url: toReturn[1] };
    } 
  },
  ideas_node: { 
    type: BOOLEAN 
  },
  notable_ideas: { 
    type: ARRAY(STRING),
    get: function() {
      let toReturn = this.getDataValue('notable_ideas').split('|');
      return { idea: toReturn[0], url: toReturn[1] };
    } 
  },
  work_node: { 
    type: BOOLEAN 
  },
  notable_works: { 
    type: ARRAY(STRING),
    get: function() {
      let toReturn = this.getDataValue('notable_works').split('|');
      return { work: toReturn[0], url: toReturn[1] };
    } 
  },
  influences_node: { 
    type: BOOLEAN 
  },
  influences: { 
    type: ARRAY(STRING),
    get: function() {
      let toReturn = this.getDataValue('influences').split('|');
      return { influences: toReturn[0], url: toReturn[1] };
    } 
  },
  influenced_node: { 
    type: BOOLEAN 
  },
  influenced: { 
    type: ARRAY(STRING),
    get: function() {
      let toReturn = this.getDataValue('influenced').split('|');
      return { influenced: toReturn[0], url: toReturn[1] };
    } 
  },
});