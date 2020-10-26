'use strict';

const { colours } = require('../config');

module.exports = (error, errorMsg, fieldTitle, fieldContent) => {
	const { embedScaffold } = require('./');
	
	console.error(error);
	embedScaffold(null, errorMsg, colours.error, 'debug', fieldTitle, fieldContent, `\`\`\`js\n${error.stack}\`\`\``);
};