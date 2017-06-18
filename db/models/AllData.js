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
      let data = this.getDataValue('schools');
      if (data) return getter(data, 'schools');
    }
  },
  interest_node: { 
    type: BOOLEAN 
  },
  main_interests: { 
    type: ARRAY(STRING),
    get: function() {
      let data = this.getDataValue('main_interests');
      if (data) return getter(data, 'main_interests');
    }
  },
  ideas_node: { 
    type: BOOLEAN 
  },
  notable_ideas: { 
    type: ARRAY(STRING),
    get: function() {
      let data = this.getDataValue('notable_ideas');
      if (data) return getter(data, 'notable_ideas');
    }
  },
  work_node: { 
    type: BOOLEAN 
  },
  notable_works: { 
    type: ARRAY(STRING),
    get: function() {
      let data = this.getDataValue('notable_works');
      if (data) return getter(data, 'notable_works');
    }
  },
  influences_node: { 
    type: BOOLEAN 
  },
  influences: { 
    type: ARRAY(STRING),
    get: function() {
      let data = this.getDataValue('influences');
      if (data) return getter(data, 'influences');
    }
  },
  influenced_node: { 
    type: BOOLEAN 
  },
  influenced: { 
    type: ARRAY(STRING),
    get: function() {
      let data = this.getDataValue('influenced');
      if (data) return getter(data, 'influenced');
    }
  },
});

const getter = (data, name) => {
  let toReturn = [];
  data.forEach(d => {
    let dArr = d.split('|');
    let dObj;
    let dObj[name] = dArr[0].trim();
    let dObj.url = dArr[1].trim();
    toReturn.push(dObj);
  });
  return toReturn;
}