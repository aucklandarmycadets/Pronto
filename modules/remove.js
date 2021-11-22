'use strict';

module.exports = (arr, str, index) => {
	if (index == undefined) index = arr.indexOf(str);
	if (index !== -1) arr.splice(index, 1);
	return arr;
};