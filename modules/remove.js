'use strict';

module.exports = (arr, str) => {
	const index = arr.indexOf(str);
	if (index > -1) return arr.splice(index, 1);
	return arr;
};