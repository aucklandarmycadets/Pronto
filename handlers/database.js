'use strict';

const { ids: { defaultServer } } = require('../config');

module.exports = async guild => {
	const Guild = require('../models/guild');
	const { newGuild } = require('../handlers');

	const id = (guild)
		? guild.id
		: defaultServer;

	return await Guild.findOne({ guildID: id }, (error, found) => {
		if (error) console.error(error);
		if (!found) newGuild(guild);
	});
};