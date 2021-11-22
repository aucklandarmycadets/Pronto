'use strict';

const { removeGuild } = require('../handlers');

module.exports = {
	bot: ['guildDelete'],
	process: [],
	handler(_, guild) {
		return removeGuild(guild);
	},
};