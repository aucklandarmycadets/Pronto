'use strict';

const { removeGuild } = require('../handlers');

module.exports = {
	events: ['guildDelete'],
	process: [],
	handler(_, guild) {
		return removeGuild(guild);
	},
};