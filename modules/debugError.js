'use strict';

const { colours } = require('../config');
const { embedScaffold } = require('./');

module.exports = (error, errorMsg, fieldTitle, fieldContent) => {
	console.error(error);
	embedScaffold(null, errorMsg, colours.error, 'debug', fieldTitle, fieldContent, `\`\`\`js\n${error.stack}\`\`\``);
};