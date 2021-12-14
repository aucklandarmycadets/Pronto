'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { Guild } = require('../models');

/** */

/**
 *
 * @function handlers.overwriteCommands
 * @param {Discord.Guild} guild
 * @returns {Promise<Typings.GuildConfiguration>}
 */
module.exports = async guild => {
	const commands = await require('../commands/commands')(guild);

	/**
	 * @type {Partial<Typings.GuildConfiguration>}
	 */
	const document = await Guild.findOne({ guildId: guild.id }).exec()
		.catch(error => console.error(error));

	document.commands = commands;

	return await document.save().catch(error => console.error(error));
};