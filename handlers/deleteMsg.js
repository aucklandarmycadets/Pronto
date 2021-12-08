'use strict';

const { debugError } = require('../handlers');

module.exports = msg => {
	(msg.guild)
		? msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content))
		: (msg.author.bot)
			? msg.delete().catch(error => debugError(error, 'Error deleting message in DMs'))
			: null;
};