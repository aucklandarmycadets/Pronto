'use strict';

const { botPermsHandler, newGuild } = require('../handlers');

module.exports = {
	events: ['guildCreate'],
	process: [],
	async execute(event, guild) {
		await newGuild(guild);
		botPermsHandler(guild);
	},
};