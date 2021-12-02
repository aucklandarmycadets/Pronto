'use strict';

const dateFormat = require('dateformat');

module.exports = async date => {
	const { settings: { longDate } } = await require('../handlers/database')();
	return dateFormat(date, longDate);
};