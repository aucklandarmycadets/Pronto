'use strict';

module.exports = obj => {
	let mentions = '';
	obj.each(mention => mentions += `${mention}\n`);
	return mentions.replace(/\n+$/, '');
};