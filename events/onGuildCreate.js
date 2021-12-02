'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

const { emojis } = require('../config');
const { newGuild, verifyBotPermissions } = require('../handlers');

module.exports = {
	bot: ['guildCreate'],
	process: [],
	/**
	 * Event handler to initialise the \<Guild> whenever the \<Client> joins a new \<Guild>
	 * @param {'guildCreate'} _ The event that was emitted
	 * @param {Discord.Guild} guild The created \<Guild>
	 */
	async handler(_, guild) {
		// Initialise the guild by calling handlers.newGuild()
		await newGuild(guild);
		// Call handlers.verifyBotPermissions() to ensure the bot has the necessary <Discord.Permissions>
		verifyBotPermissions(guild);

		// Loop through each of Pronto's configured emojis in ..\config.js
		for (const emoji of Object.values(emojis)) {
			// If the guild does not already have a guild with a matching name, create it for the guild
			if (!guild.emojis.cache.some(guildEmoji => guildEmoji.name === emoji.name)) {
				guild.emojis.create(emoji.URL, emoji.name);
			}
		}
	},
};