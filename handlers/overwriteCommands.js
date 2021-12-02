'use strict';

module.exports = async guild => {
	const { Guild } = require('../models');
	const cmds = await require('../cmds')(guild);

	const database = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	database.cmds = cmds;

	return await database.save().catch(error => console.error(error));
};