'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { removeGuild } = require('../handlers');

module.exports = {
	bot: ['guildDelete'],
	process: [],
	/**
	 * Event handler to delete the guild's database whenever a \<Guild> kicks the \<Client> or the \<Guild> is deleted/left
	 * @param {'guildCreate'} _ The event that was emitted
	 * @param {Discord.Guild} guild The \<Guild> that was deleted
	 */
	handler(_, guild) {
		// Remove the guild's database using handlers.removeGuild()
		removeGuild(guild);
	},
};