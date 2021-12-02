'use strict';

module.exports = (arrayOne, arrayTwo) => {
	if (arrayOne === arrayTwo) return true;
	if (arrayOne === null || arrayTwo === null) return false;
	if (!arrayOne.length) return false;
	if (arrayOne.length !== arrayTwo.length) return false;

	return arrayOne.every((element, i) => element === arrayTwo[i]);
};