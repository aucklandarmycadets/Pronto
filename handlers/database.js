'use strict';

module.exports = async guild => {
	const Guild = require('../models/guild');
	const { newGuild } = require('../handlers');

	return await Guild.findOne({ guildID: guild.id }, (error, found) => {
		if (error) console.error(error);
		if (!found) newGuild(guild);
	});
};