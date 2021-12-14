'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { embedScaffold, errorReact, findGuildConfiguration } = require('../handlers');

/** */

/**
 *
 * @function handlers.directCommandError
 * @param {Discord.Message} msg The erroneous command message
 * @param {'NO_PERMISSION' | 'HAS_ROLE_MENTION' | 'NO_DIRECT' | 'MULTIPLE_GUILDS'} [type] The reason for the command error
 */
module.exports = async (msg, type) => {
	// There will not be a guild as sent in DMs
	const { colours } = await findGuildConfiguration();

	errorReact(msg);

	try {
		if (type === 'NO_PERMISSION') throw 'You do not have access to that command.';
		else if (type === 'HAS_ROLE_MENTION') throw 'Please use a server channel for that command.';
		else if (type === 'NO_DIRECT') throw 'That command cannot be used in DMs.';
		else if (type === 'MULTIPLE_GUILDS') throw 'We share multiple servers, please use a server channel!';
		else throw 'Invalid command.';
	}

	catch (error) { embedScaffold(null, msg.author, error, colours.error, 'DIRECT'); }
};