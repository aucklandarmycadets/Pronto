'use strict';

module.exports = (arr1, arr2) => {
	return [ ...arr1.filter(value => arr2.indexOf(value) === -1),
		...arr2.filter(value => arr1.indexOf(value) === -1) ];
};