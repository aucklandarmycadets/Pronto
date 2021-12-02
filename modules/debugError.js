'use strict';

module.exports = async (error, errorMsg, fieldTitle, fieldContent) => {
	const { embedScaffold, jsCodeBlock } = require('./');
	const { colours } = await require('../handlers/database')();

	console.error(error);
	embedScaffold(null, null, errorMsg, colours.error, 'DEBUG', fieldTitle, fieldContent, jsCodeBlock(error.stack));
};