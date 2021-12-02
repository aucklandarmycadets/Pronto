'use strict';

// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

/**
 * @namespace models
 */
module.exports = {
	models: exports,
	/** @type {mongoose.Model} */
	Attendance: require('./attendance'),
	/** @type {mongoose.Model} */
	Guild: require('./guild'),
	/** @type {mongoose.Model} */
	Lesson: require('./lesson'),
};