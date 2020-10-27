'use strict';

const Guild = require('../models/guild');

module.exports = {
	events: ['guildDelete'],
	process: [],
	async execute(event, guild) {
		Guild.findOneAndDelete({ guildID: guild.id }, error => {
			if (error) console.error(error);
		});
	},
};