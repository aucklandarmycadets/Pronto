'use strict';

module.exports = (array, str, index) => {
	if (index == undefined) index = array.indexOf(str);
	if (index !== -1) array.splice(index, 1);
	return array;
};