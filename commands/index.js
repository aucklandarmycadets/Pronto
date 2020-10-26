'use strict';

const fs = require('fs');

const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of commands) {
	const commandName = file.replace('.js', '');
	exports[commandName] = require(`./${commandName}`);
}