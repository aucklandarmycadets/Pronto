'use strict';

const mongoose = require('mongoose');
const { databaseOptions } = require('../config');

module.exports = {
	login(uri) {
		mongoose.connect(uri, databaseOptions);
		mongoose.set('useFindAndModify', false);

		mongoose.connection.on('err', error => console.error('Mongoose connection error:\n', error));
	},
};