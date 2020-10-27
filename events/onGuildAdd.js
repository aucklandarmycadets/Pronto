'use strict';

const { botPermsHandler, newGuild } = require('../handlers');

module.exports = {
	events: ['guildCreate'],
	process: [],
	execute(event, guild) {
		botPermsHandler(guild);
		return newGuild(guild);
	},
};