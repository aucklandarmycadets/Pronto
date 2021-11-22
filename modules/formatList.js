'use strict';

module.exports = (obj, forList) => {
	const [startFormat, endFormat] = (forList)
		? ['`', '` - ']
		: ['**', ':** '];

	return Object.entries(obj)
		.reduce((list, [key, value]) => list + `${startFormat}${key}${endFormat}${value}\n`, '')
		.replace(/\n+$/, '');
};