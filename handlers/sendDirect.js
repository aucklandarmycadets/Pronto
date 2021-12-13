'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

const { colours } = require('../config');
const { jsCodeBlock } = require('../modules');
const { embedScaffold } = require('../handlers');

/** */

/**
 *
 * @function handlers.sendDirect
 * @param {Discord.User | Discord.GuildMember | Discord.DMChannel} user User to send to
 * @param {string | Discord.MessagePayload | Discord.MessageOptions} options Message options
 * @param {?Discord.GuildTextBasedChannel} guildChannel A guild channel that the user has access to, to send an error in case cannot send DM
 * @param {boolean} [toDebug=false] Whether to send the error message to debugging rather than the user in a guild channel
 * @returns {Promise<?Discord.Message>} Message if it was sent
 */
module.exports = (user, options, guildChannel, toDebug = false) => {
	// Send message to user
	return user.send(options)
		.catch(error => {
			const support = '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)';

			console.error(error);

			// Send correct error message depending on intended user
			if (toDebug) embedScaffold(null, null, `Error sending direct message to ${user}.`, colours.error, 'DEBUG', 'More Information', support, jsCodeBlock(error.stack));
			else embedScaffold(null, guildChannel, `${user} I can't send direct messages to you!`, colours.error, 'MESSAGE', 'More Information', support);
		});
};