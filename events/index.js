'use strict';

const fs = require('fs');

const events = fs.readdirSync('./events').filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of events) {
	const eventName = file.replace('.js', '');
	exports[eventName] = require(`./${eventName}`);
}