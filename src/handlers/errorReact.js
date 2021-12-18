'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { debugError, findGuildConfiguration } = require('../handlers');

/** */

/**
 *
 * @function handlers.errorReact
 * @param {Discord.Message} msg The message to error react to
 */
module.exports = async msg => {
	const { bot } = require('../pronto');
	const { ids: { guildId }, emojis } = await findGuildConfiguration(msg.guild);

	const guild = bot.guilds.cache.get(guildId);
	const errorEmoji = guild.emojis.cache.find(emoji => emoji.name === emojis.error.name);

	if (msg.deleted) return;

	msg.react(errorEmoji).catch(error => {
		try {
			if (msg.guild) throw `Error reacting to [message](${msg.url}) in ${msg.channel}.`;
			else throw 'Error reacting to message in DMs.';
		}

		catch (errorMsg) { debugError(msg.guild, error, errorMsg); }
	});
};