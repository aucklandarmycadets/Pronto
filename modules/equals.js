'use strict';

module.exports = (arr1, arr2) => {
	if (arr1 === arr2) return true;
	if (arr1 === null || arr2 === null) return false;
	if (!arr1.length) return false;
	if (arr1.length !== arr2.length) return false;

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] !== arr2[i]) return false;
	}

	return true;
};