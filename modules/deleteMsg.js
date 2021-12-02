'use strict';

module.exports = msg => {
	const { debugError } = require('./');

	(msg.guild)
		? msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content))
		: (msg.author.bot)
			? msg.delete().catch(error => debugError(error, 'Error deleting message in DMs'))
			: null;
};