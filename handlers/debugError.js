'use strict';
const { jsCodeBlock } = require('../modules');
const { database, embedScaffold } = require('../handlers');

module.exports = async (error, errorMsg, fieldTitle, fieldContent) => {
	const { colours } = await database();

	console.error(error);
	embedScaffold(null, null, errorMsg, colours.error, 'DEBUG', fieldTitle, fieldContent, jsCodeBlock(error.stack));
};