const express = require('express');
const app = express();
const path = require('path');
const db = require('../db/index.js'); 

const port = 3001;

app.use(express.static(path.join(__dirname, 'private')));

const bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '2mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

// db.sync()
//   .then(() => {
app.listen(port, function () {
  console.log(`"Your server, listening on port ${port}`);
});
  // })

app.use('/scr', require('./scr/index.js'));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public'));
});

app.use(function (err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});
