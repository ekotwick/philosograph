'use strict';

const { STRING } = require('sequelize');

module.exports = db => db.define('url', {
	name: {
		type: STRING
	},
	url: {
		type: STRING
	}
});