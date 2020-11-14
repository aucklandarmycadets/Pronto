'use strict';

const { removeGuild } = require('../handlers');

module.exports = {
	events: ['guildDelete'],
	process: [],
	execute(_, guild) {
		return removeGuild(guild);
	},
};