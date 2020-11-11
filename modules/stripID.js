'use strict';

module.exports = str => {
	const match = str.match(/^<@!?(\d+)>$/);
	if (!match) return;
	return match[1];
};