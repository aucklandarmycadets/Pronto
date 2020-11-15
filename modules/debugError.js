'use strict';

module.exports = async (error, errorMsg, fieldTitle, fieldContent) => {
	const { embedScaffold, js } = require('./');
	const { colours } = await require('../handlers/database')();

	console.error(error);
	embedScaffold(null, null, errorMsg, colours.error, 'debug', fieldTitle, fieldContent, js(error.stack));
};