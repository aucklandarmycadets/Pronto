'use strict';

const { emojis } = require('../config');
const { botPermsHandler, newGuild } = require('../handlers');

module.exports = {
	events: ['guildCreate'],
	process: [],
	async execute(event, guild) {
		await newGuild(guild);
		botPermsHandler(guild);

		for (const prontoEmoji of Object.values(emojis)) {
			if (!guild.emojis.cache.some(guildEmoji => guildEmoji.name === prontoEmoji.name)) {
				guild.emojis.create(prontoEmoji.URL, prontoEmoji.name);
			}
		}
	},
};