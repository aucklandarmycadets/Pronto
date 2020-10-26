'use strict';

const fs = require('fs');

const modules = fs.readdirSync('./modules').filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of modules) {
	const moduleName = file.replace('.js', '');
	exports[moduleName] = require(`./${moduleName}`);
}