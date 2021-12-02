'use strict';

module.exports = (arrayOne, arrayTwo) => {
	return [ ...arrayOne.filter(value => arrayTwo.indexOf(value) === -1),
		...arrayTwo.filter(value => arrayOne.indexOf(value) === -1) ];
};