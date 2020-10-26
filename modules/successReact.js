'use strict';

const { ids: { serverID }, emojis } = require('../config');

module.exports = msg => {
	const { bot } = require('../pronto');
	const { debugError } = require('./');

	const server = bot.guilds.cache.get(serverID);
	const successEmoji = server.emojis.cache.find(emoji => emoji.name === emojis.success);

	msg.react(successEmoji).catch(error => {
		try {
			if (msg.guild) throw `Error reacting to [message](${msg.url}) in ${msg.channel}.`;
			else throw 'Error reacting to message in DMs.';
		}

		catch (errorMsg) { debugError(error, errorMsg); }
	});
};