'use strict';

const { ids: { defaultServer } } = require('../config');

module.exports = async guild => {
	const Guild = require('../models/guild');
	const { newGuild } = require('./');

	const id = (guild)
		? guild.id
		: defaultServer;

	const foundGuild = await Guild.findOne({ guildID: id }, error => {
		if (error) console.error(error);
	});

	return foundGuild || await newGuild(guild);
};