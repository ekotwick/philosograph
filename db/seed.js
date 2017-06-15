'use strict';

const db = require('./index');
const { Url } = db;
const {mapValues} = require('lodash');
const Promise = require('bluebird');
const generatorFuncs = require('./seedUtils');
const generateUserAttempts = generatorFuncs.generateUserAttempts;
const generateAllUserAttempts = generatorFuncs.generateAllUserAttempts;

function seedEverything() {
	const seeded = {
		urls: Url()
	};

	return Promise.props(seeded);

}

const urls = seed(Urls, {});

if (module === require.main) {
	console.log('first here!');
	db.didSync
		.then(() => db.sync({force: true}))
		.then((data) => {
			console.log('here!');
			return data;
		})
		.then(seedEverything)
		.catch(err => console.error(err))
		.finally(() => process.exit(0));
}

class BadRow extends Error {
	constructor(key, row, error) {
		super(error);
		this.cause = error;
		this.row = row;
		this.key = key;
	}

	toString() {
		return `[${this.key}] ${this.cause} while creating ${JSON.stringify(this.row, 0, 2)}`;
	}
}

function seed(Model, rows) {
	return (others={}) => {
		if (typeof rows === 'function') {
			rows = Promise.props(
				mapValues(others,
					other =>
						typeof other === 'function' ? other() : other)
			).then(rows);
		}

		return Promise.resolve(rows)
			.then(rows => Promise.props(
				Object.keys(rows)
					.map(key => {
						const row = rows[key];
						return {
							key,
							value: Promise.props(row)
								.then(row => Model.create(row)
									.catch(error => { throw new BadRow(key, row, error) })
								)
						}
					}).reduce(
						(all, one) => Object.assign({}, all, {[one.key]: one.value}),
						{}
					)
				)
			)
			.then(seeded => {
				console.log(`Seeded ${Object.keys(seeded).length} ${Model.name} OK`);
				return seeded
			}).catch(error => {
				console.error(`Error seeding ${Model.name}: ${error} \n${error.stack}`);
			})
	}
}

module.exports = Object.assign(seed, {targets});



