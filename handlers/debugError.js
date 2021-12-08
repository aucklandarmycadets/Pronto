'use strict';
const { jsCodeBlock } = require('../modules');
const { embedScaffold, findGuildConfiguration } = require('../handlers');

module.exports = async (error, errorMsg, fieldTitle, fieldContent) => {
	const { colours } = await findGuildConfiguration();

	console.error(error);
	embedScaffold(null, null, errorMsg, colours.error, 'DEBUG', fieldTitle, fieldContent, jsCodeBlock(error.stack));
};