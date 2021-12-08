'use strict';

const { database, debugError } = require('../handlers');

module.exports = async msg => {
	const { bot } = require('../pronto');
	const { ids: { guildID }, emojis } = await database(msg.guild);

	const guild = bot.guilds.cache.get(guildID);
	const successEmoji = guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

	if (msg.deleted) return;

	msg.react(successEmoji).catch(error => {
		try {
			if (msg.guild) throw `Error reacting to [message](${msg.url}) in ${msg.channel}.`;
			else throw 'Error reacting to message in DMs.';
		}

		catch (errorMsg) { debugError(error, errorMsg); }
	});
};