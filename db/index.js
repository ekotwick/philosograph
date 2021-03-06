const Sequelize = require('sequelize');
const url = 'postgres://localhost:5432/philosograph';

const db = module.exports = new Sequelize(url, {
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true
  },
  logging: false
});

Object.assign(db, require('./models/index.js')(db), {createAndSync});

db.didSync = db.createAndSync();

function createAndSync(force=false) {
  return db.sync({force})
    .then(() => { console.log(`Synced models to db: ${url}\n\n`) })
    .catch(err => { console.log(err)});
}
