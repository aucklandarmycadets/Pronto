'use strict';

module.exports = async (msg, type) => {
	const { embedScaffold, errorReact } = require('./');
	const { colours } = await require('../handlers/database')(msg.guild);

	errorReact(msg);

	try {
		if (type === 'noPerms') throw 'You do not have access to that command.';
		else if (type === 'hasRole') throw 'Please use a server channel for that command.';
		else if (type === 'noDM') throw 'That command cannot be used in DMs.';
		else throw 'Invalid command.';
	}

	catch (error) { embedScaffold(msg.author, error, colours.error, 'dm'); }
};