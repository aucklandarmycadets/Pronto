'use strict';

const { emojis } = require('../config');
const { botPermsHandler, newGuild } = require('../handlers');

module.exports = {
	bot: ['guildCreate'],
	process: [],
	async handler(_, guild) {
		await newGuild(guild);
		botPermsHandler(guild);

		for (const emoji of Object.values(emojis)) {
			if (!guild.emojis.cache.some(guildEmoji => guildEmoji.name === emoji.name)) {
				guild.emojis.create(emoji.URL, emoji.name);
			}
		}
	},
};