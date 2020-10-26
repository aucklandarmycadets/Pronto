'use strict';

module.exports = (str, lim) => {
	return (str.length > lim)
		? (str.slice(-(str.length - lim)).includes('```'))
			? `${str.slice(0, lim - 6)}...\`\`\``
			: `${str.slice(0, lim - 3)}...`
		: str;
};