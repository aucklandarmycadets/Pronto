'use strict';

module.exports = async guild => {
	const { Guild } = require('../models');
	const commands = await require('../commands')(guild);

	/**
	 * @type {Guild}
	 */
	const database = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	database.commands = commands;

	return await database.save().catch(error => console.error(error));
};