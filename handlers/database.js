'use strict';

const { ids: { defaultServer } } = require('../config');

module.exports = async guild => {
	const Guild = require('../models/guild');
	const { newGuild } = require('../handlers');

	const id = (guild)
		? guild.id
		: defaultServer;

	const database = await Guild.findOne({ guildID: id }, async (error, found) => {
		if (error) console.error(error);
		if (!found) return await newGuild(guild);
	});

	return await Guild.findOne({ guildID: id });
};