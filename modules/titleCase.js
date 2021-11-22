'use strict';

module.exports = str => {
	return str.split(' ')
		.map(substr => `${substr.charAt(0).toUpperCase()}${substr.slice(1)}`)
		.join(' ');
};