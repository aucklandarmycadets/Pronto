'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { emojis } = require('../config');
const { createGuild, verifyBotPermissions } = require('../handlers');

/**
 * @member {events.EventModule} events.onGuildCreate Event handler to initialise the \<GuildConfiguration> whenever the \<Client> joins a new \<Guild>
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['guildCreate'],
	process: [],
	/**
	 * @param {'guildCreate'} _ The event that was emitted
	 * @param {Discord.Guild} guild The created \<Guild>
	 */
	async handler(_, guild) {
		// Initialise the guild by calling handlers.createGuild()
		await createGuild(guild);
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