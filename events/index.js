'use strict';

// Load the events folder with handlers.processIndex()
module.exports = processIndex('./events');

function processIndex(directory) {
	const fs = require('fs');

	const files = fs.readdirSync(directory).filter(file => file.endsWith('.js') && file !== 'index.js');

	return Object.fromEntries(
		files.map(file => {
			const moduleName = file.replace('.js', '');
			return [moduleName, require(`.${directory}/${moduleName}`)];
		}),
	);
}