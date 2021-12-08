'use strict';

const { embedScaffold, errorReact, findGuildConfiguration } = require('../handlers');

module.exports = async msg => {
	const { colours } = await findGuildConfiguration(msg.guild);

	errorReact(msg);

	const [destination, destinationSymbol] = (msg.guild)
		? [msg.channel, 'MESSAGE']
		: [msg.author, 'DIRECT'];

	embedScaffold(null, destination, 'There was an error verifying permissions, please try again later.', colours.error, destinationSymbol);

	return 'ERROR';
};