'use strict';

module.exports = async msg => {
	const { embedScaffold, errorReact } = require('./');
	const { colours } = await require('../handlers/database')(msg.guild);

	errorReact(msg);

	const [destination, destinationSymbol] = (msg.guild)
		? [msg.channel, 'MESSAGE']
		: [msg.author, 'DIRECT'];

	embedScaffold(null, destination, 'There was an error verifying permissions, please try again later.', colours.error, destinationSymbol);

	return 'ERROR';
};