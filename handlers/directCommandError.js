'use strict';

const { database, embedScaffold, errorReact } = require('../handlers');

module.exports = async (msg, type) => {
	// There will not be a guild as sent in DMs
	const { colours } = await database();

	errorReact(msg);

	try {
		if (type === 'NO_PERMISSION') throw 'You do not have access to that command.';
		else if (type === 'HAS_ROLE_MENTION') throw 'Please use a server channel for that command.';
		else if (type === 'NO_DIRECT') throw 'That command cannot be used in DMs.';
		else if (type === 'MULTIPLE_GUILDS') throw 'We share multiple servers, please use a server channel!';
		else throw 'Invalid command.';
	}

	catch (error) { embedScaffold(null, msg.author, error, colours.error, 'DIRECT'); }
};