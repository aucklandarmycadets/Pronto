'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { Guild } = require('../models');

/**
 *
 * @param {Discord.Guild} guild
 * @returns {Promise<Typings.Guild>}
 */
module.exports = async guild => {
	const commands = await require('../commands/commands')(guild);

	/**
	 * @type {Typings.Guild}
	 */
	const document = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	document.commands = commands;

	return await document.save().catch(error => console.error(error));
};