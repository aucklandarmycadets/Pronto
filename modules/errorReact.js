'use strict';

const { ids: { serverID }, emojis: { errorEmoji } } = require('../config');
const { debugError } = require('./');

module.exports = msg => {
	const { bot } = require('../pronto');

	const server = bot.guilds.cache.get(serverID);
	const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);

	msg.react(errorEmojiObj).catch(error => {
		try {
			if (msg.guild) throw `Error reacting to [message](${msg.url}) in ${msg.channel}.`;
			else throw 'Error reacting to message in DMs.';
		}

		catch (errorMsg) { debugError(error, errorMsg); }
	});
};