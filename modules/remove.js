'use strict';

module.exports = (arr, str) => {
	const index = arr.indexOf(str);
	return (index > -1)
		? arr.splice(index, 1)
		: arr;
};