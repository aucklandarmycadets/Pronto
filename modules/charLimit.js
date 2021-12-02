'use strict';

module.exports = (str, lim = 2048) => {
	str = (str.length > lim)
		? (str.slice(-(str.length - lim)).includes('```'))
			? `${str.slice(0, lim - 6)}...\`\`\``
			: `${str.slice(0, lim - 3)}...`
		: str;

	return (str.length)
		? str
		: 'No message content';
};