'use strict';

module.exports = async (msg, emoji) => {
	const { debugError } = require('./');

	msg.react(emoji).catch(error => {
		try {
			if (msg.guild) throw `Error reacting to [message](${msg.url}) in ${msg.channel}.`;
			else throw 'Error reacting to message in DMs.';
		}

		catch (errorMsg) { debugError(error, errorMsg); }
	});
};