'use strict';

const { colours } = require('../config');

module.exports = (error, errorMsg, fieldTitle, fieldContent) => {
	const { embedScaffold, js } = require('./');
	
	console.error(error);
	embedScaffold(null, errorMsg, colours.error, 'debug', fieldTitle, fieldContent, js(error.stack));
};