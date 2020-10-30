'use strict';

const dateFormat = require('dateformat');

module.exports = async date => {
	const { config: { dateOutput } } = await require('../handlers/database')();
	return dateFormat(date, dateOutput);
};