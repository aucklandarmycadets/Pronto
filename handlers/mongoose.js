'use strict';

const mongoose = require('mongoose');
const { dbOptions } = require('../config');

module.exports = {
	login(uri) {
		mongoose.connect(uri, dbOptions);
		mongoose.set('useFindAndModify', false);

		mongoose.connection.on('connected', () => console.log('Mongoose has successfully connected!'));
		mongoose.connection.on('err', error => console.error(`Mongoose connection error: \n${error}`));
		mongoose.connection.on('disconnected', () => console.warn('Disconnected from Mongoose'));
	},
};