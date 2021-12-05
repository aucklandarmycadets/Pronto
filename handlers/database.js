'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { ids: { DEFAULT_GUILD } } = require('../config');
const { Guild } = require('../models');
const { merge } = require('../modules');

/**
 * - `handlers.database()` queries the MongoDB database for the guild's \<Guild> document if it exists, or will first call `handlers.createGuild()`
 * to create the \<Guild> document
 * - If the guild is `null`, the document of Pronto's 'master' guild is returned
 * @function handlers.database
 * @param {?Discord.Guild} guild The guild to find the \<Guild> document for
 * - If `null`, the \<Guild> document of the default guild defined by `config.ids.DEFAULT_GUILD` will be returned instead
 * @param {Partial<Typings.Guild>} changes A Partial\<Guild> object of the values to update within the \<Guild> document
 * @returns {Promise<Typings.Guild>} The guild's \<Guild> document, or the `config.ids.DEFAULT_GUILD`'s \<Guild> document
 */
module.exports = async (guild, changes) => {
	const { bot } = await require('../pronto');
	const { createGuild } = require('./');

	// If the guild is null, replace it with the <Guild> object of the default guild
	guild = guild || bot.guilds.cache.get(DEFAULT_GUILD);

	/**
	 * Attempt to find the \<Guild> document by querying for the guild's identifier
	 * @type {Typings.Guild}
	 */
	let document = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	// If there are no changes to upsert, return the document if it was found, or create (and return) a new document for the guild by calling handlers.createGuild()
	if (!changes) return document || await createGuild(guild);

	else if (changes instanceof Object) {
		// Otherwise, if there are changes to upsert, call modules.merge() to merge the two objects
		document = merge(document, changes);

		// Iterate through each changed key and ensure the path is marked as having been changed
		Object.keys(changes).forEach(key => document.markModified(key));
	}

	// Save any changes to the <Guild> and return it
	return await document.save().catch(error => console.error(error));
};