'use strict';

const mongoose = require('mongoose');
const { dbOptions } = require('../config');

module.exports = {
	login(uri) {
		mongoose.connect(uri, dbOptions);
		mongoose.set('useFindAndModify', false);

		mongoose.connection.on('err', error => console.error('Mongoose connection error:\n', error));
	},
};