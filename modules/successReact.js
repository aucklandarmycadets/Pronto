'use strict';

module.exports = async msg => {
	const { bot } = require('../pronto');
	const { debugError } = require('./');
	const { ids: { serverID }, emojis } = await require('../handlers/database')(msg.guild);

	const server = bot.guilds.cache.get(serverID);
	const successEmoji = server.emojis.cache.find(emoji => emoji.name === emojis.success.name);

	if (msg.deleted) return;

	msg.react(successEmoji).catch(error => {
		try {
			if (msg.guild) throw `Error reacting to [message](${msg.url}) in ${msg.channel}.`;
			else throw 'Error reacting to message in DMs.';
		}

		catch (errorMsg) { debugError(error, errorMsg); }
	});
};