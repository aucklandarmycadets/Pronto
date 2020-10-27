'use strict';

const { removeGuild } = require('../handlers');

module.exports = {
	events: ['guildDelete'],
	process: [],
	execute(event, guild) {
		return removeGuild(guild);
	},
};