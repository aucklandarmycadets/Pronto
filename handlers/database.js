'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { ids: { DEFAULT_GUILD } } = require('../config');
const { Guild } = require('../models');
const { merge } = require('../modules');

/**
 *
 * @param {?Discord.Guild} guild
 * @param {*} changes
 * @returns {Promise<Typings.Guild>}
 */
module.exports = async (guild, changes) => {
	const { bot } = await require('../pronto');
	const { createGuild } = require('./');

	// If the guild is null, replace it with the <Guild> object of the default guild
	guild = guild || bot.guilds.cache.get(DEFAULT_GUILD);

	/**
	 * @type {Typings.Guild}
	 */
	let database = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	if (!changes) return database || await createGuild(guild);

	else if (changes instanceof Object) {
		// Otherwise, if there are changes to upsert, call modules.merge() to merge the two objects
		database = merge(database, changes);

		// Iterate through each changed key and ensure the path is marked as having been changed
		Object.keys(changes).forEach(key => database.markModified(key));
	}

	// Save any changes to the <Guild> and return it
	return await database.save().catch(error => console.error(error));
};