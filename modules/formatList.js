'use strict';

module.exports = (obj, forList) => {
	const [startFormat, endFormat] = (forList)
		? ['`', '` - ']
		: ['**', ':** '];

	return Object.entries(obj)
		.map(([key, value]) => `${startFormat}${key}${endFormat}${value}`)
		.join('\n');
};