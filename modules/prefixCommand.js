'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

/**
 *
 * @param {Typings.BaseCommand} command
 * @param {?Discord.Guild} guild
 * @returns {Promise<string>}
 */
module.exports = async (command, guild) => {
	const { settings: { prefix } } = await require('../handlers/database')(guild);
	return `${prefix}${command.command}`;
};