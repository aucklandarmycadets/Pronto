'use strict';

module.exports = (object, forList) => {
	const [startFormat, endFormat] = (forList)
		? ['`', '` - ']
		: ['**', ':** '];

	// Map each list value to a new string[] of formatted strings, then join the string[] with a newline separator
	return Object.entries(object)
		.map(([key, value]) => `${startFormat}${key}${endFormat}${value}`)
		.join('\n');
};