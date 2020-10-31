'use strict';

module.exports = (obj, forList) => {
	let helpString = '';

	const [startFormat, endFormat] = (forList)
		? ['`', '` - ']
		: ['**', ':** '];

	for (const [key, value] of Object.entries(obj)) {
		helpString += `${startFormat}${key}${endFormat}${value}\n`;
	}

	return helpString.replace(/\n+$/, '');
};