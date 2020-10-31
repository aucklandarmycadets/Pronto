'use strict';

module.exports = string => {
	return (typeof string === 'string')
		? string.charAt(0).toUpperCase() + string.slice(1)
		: string;
};