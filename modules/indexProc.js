'use strict';

module.exports = dir => {
	const fs = require('fs');

	const files = fs.readdirSync(dir).filter(file => file.endsWith('.js') && file !== 'index.js');

	const procObj = {};

	for (const file of files) {
		const key = file.replace('.js', '');
		procObj[key] = require(`./${key}`);
	}

	return procObj;
};