'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { embedScaffold, errorReact, findGuildConfiguration } = require('../handlers');

/** */

/**
 *
 * @function handlers.getRoleError
 * @param {Discord.Message} msg The command message
 * @returns {Promise<'ERROR'>} An error!
 */
module.exports = async msg => {
	const { colours } = await findGuildConfiguration(msg.guild);

	errorReact(msg);

	const [destination, destinationSymbol] = (msg.guild)
		? [msg.channel, 'MESSAGE']
		: [msg.author, 'DIRECT'];

	embedScaffold(null, destination, 'There was an error verifying permissions, please try again later.', colours.error, destinationSymbol);

	return 'ERROR';
};