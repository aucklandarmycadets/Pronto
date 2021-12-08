'use strict';

const { database, debugError } = require('../handlers');

module.exports = async msg => {
	const { bot } = require('../pronto');
	const { ids: { guildID }, emojis } = await database(msg.guild);

	const guild = bot.guilds.cache.get(guildID);
	const errorEmoji = guild.emojis.cache.find(emoji => emoji.name === emojis.error.name);

	if (msg.deleted) return;

	msg.react(errorEmoji).catch(error => {
		try {
			if (msg.guild) throw `Error reacting to [message](${msg.url}) in ${msg.channel}.`;
			else throw 'Error reacting to message in DMs.';
		}

		catch (errorMsg) { debugError(error, errorMsg); }
	});
};