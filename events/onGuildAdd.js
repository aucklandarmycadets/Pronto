'use strict';

const { newGuild } = require('../handlers');

module.exports = {
	events: ['guildCreate'],
	process: [],
	execute(event, guild) {
		return newGuild(guild);
	},
};