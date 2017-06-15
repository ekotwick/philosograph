'use strict'

const router = require('express').Router();

router.use('/phil', require('./philosophers'));
router.use('/firstUrl', require('./sortPhilosophers'));

router.get('/', (req, res, next) => {
	res.sendStatus(200);
});

router.use(function (req, res, next) {
  const err = new Error('Not found.');
  err.status = 404;
  next(err);
});

module.exports = router;
