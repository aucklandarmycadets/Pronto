'use strict';

const dateFormat = require('dateformat');
const { database } = require('../handlers');

module.exports = async date => {
	const { settings: { longDate } } = await database();
	return dateFormat(date, longDate);
};