'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { removeGuild } = require('../handlers');

/**
 * @member {events.EventModule} events.onGuildDelete Event handler to delete the guild's document whenever a \<Guild> kicks the \<Client> or the \<Guild> is deleted/left
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['guildDelete'],
	process: [],
	/**
	 * @param {'guildCreate'} _ The event that was emitted
	 * @param {Discord.Guild} guild The \<Guild> that was deleted
	 */
	handler(_, guild) {
		// Remove the guild's document using handlers.removeGuild()
		removeGuild(guild);
	},
};