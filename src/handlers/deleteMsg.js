'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { debugError } = require('../handlers');

/** */

/**
 *
 * @function handlers.deleteMsg
 * @param {Discord.Message} msg The message to delete
 */
module.exports = msg => {
	(msg.guild)
		? msg.delete().catch(error => debugError(msg.guild, error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content))
		: (msg.author.bot)
			? msg.delete().catch(error => debugError(null, error, 'Error deleting message in DMs'))
			: null;
};