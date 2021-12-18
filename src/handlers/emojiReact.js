'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { debugError } = require('../handlers');

/** */

/**
 *
 * @function handlers.emojiReact
 * @param {Discord.Message} msg The message to react to
 * @param {Discord.EmojiIdentifierResolvable} emoji The emoji to react with
 */
module.exports = async (msg, emoji) => {
	msg.react(emoji).catch(error => {
		try {
			if (msg.guild) throw `Error reacting to [message](${msg.url}) in ${msg.channel}.`;
			else throw 'Error reacting to message in DMs.';
		}

		catch (thrownError) { debugError(msg.guild, error, thrownError); }
	});
};