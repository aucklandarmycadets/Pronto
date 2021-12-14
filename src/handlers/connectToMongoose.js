'use strict';

const mongoose = require('mongoose');
const { databaseOptions } = require('../config');

/** */

/**
 *
 * @function handlers.connectToMongoose
 * @param {string} uri MongoDB connection URI
 */
module.exports = uri => {
	mongoose.connect(uri, databaseOptions);

	mongoose.connection.on('err', error => console.error('Mongoose connection error:\n', error));
};