'use strict';

// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');
const { Guild } = require('../models');

module.exports = async guild => {
	const commands = await require('../commands')(guild);

	/**
	 * @type {Typings.Guild}
	 */
	const database = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	database.commands = commands;

	return await database.save().catch(error => console.error(error));
};