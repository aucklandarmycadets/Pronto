'use strict';

module.exports = async (dir, guild) => {
	const fs = require('fs');

	const files = fs.readdirSync(dir).filter(file => file.endsWith('.js') && file !== 'index.js');

	const procObj = {};

	for (const file of files) {
		const key = file.replace('.js', '');
		procObj[key] = (guild)
			? await require(`.${dir}/${key}`)(guild)
			: require(`.${dir}/${key}`);
	}

	return procObj;
};