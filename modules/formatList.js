'use strict';

module.exports = (obj, forList) => {
	const [startFormat, endFormat] = (forList)
		? ['`', '` - ']
		: ['**', ':** '];

	// Map each list value to a new string[] of formatted strings, then join the string[] with a newline separator
	return Object.entries(obj)
		.map(([key, value]) => `${startFormat}${key}${endFormat}${value}`)
		.join('\n');
};