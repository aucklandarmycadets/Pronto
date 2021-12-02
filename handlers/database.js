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
	const { createGuild } = require('./');

	const id = (guild)
		? guild.id
		: DEFAULT_GUILD;

	/**
	 * @type {Typings.Guild}
	 */
	let database = await Guild.findOne({ guildID: id }, error => {
		if (error) console.error(error);
	});

	if (!changes) return database || await createGuild(guild);

	if (changes instanceof Object) database = merge(database, changes);
	Object.keys(changes).forEach(key => database.markModified(key));

	return await database.save().catch(error => console.error(error));
};