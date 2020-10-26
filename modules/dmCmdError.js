'use strict';

const { colours } = require('../config');
const { embedScaffold, errorReact } = require('./');

module.exports = (msg, type) => {
	errorReact(msg);

	try {
		if (type === 'noPerms') throw 'You do not have access to that command.';
		else if (type === 'hasRole') throw 'Please use a server channel for that command.';
		else if (type === 'noDM') throw 'That command cannot be used in DMs.';
		else throw 'Invalid command.';
	}

	catch (error) { embedScaffold(msg.author, error, colours.error, 'dm'); }
};