'use strict';

const dateFormat = require('dateformat');
const { findGuildConfiguration } = require('../handlers');

module.exports = async date => {
	const { settings: { longDate } } = await findGuildConfiguration();
	return dateFormat(date, longDate);
};