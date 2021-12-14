'use strict';

const mongoose = require('mongoose');

/** */

/**
 *
 * @function handlers.connectToMongoose
 * @param {string} uri MongoDB connection URI
 */
module.exports = uri => {
	mongoose.connect(uri, { family: 4 });

	mongoose.connection.on('err', error => console.error('Mongoose connection error:\n', error));
};