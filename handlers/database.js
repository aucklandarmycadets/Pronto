'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { Guild } = require('../models');

const { ids: { DEFAULT_GUILD } } = require('../config');
const { merge } = require('../modules');

/**
 *
 * @param {?Discord.Guild} guild
 * @param {*} changes
 * @returns
 */
module.exports = async (guild, changes) => {
	const { createGuild } = require('./');

	const id = (guild)
		? guild.id
		: DEFAULT_GUILD;

	/**
	 * @type {Guild}
	 */
	let database = await Guild.findOne({ guildID: id }, error => {
		if (error) console.error(error);
	});

	if (!changes) return database || await createGuild(guild);

	if (changes instanceof Object) database = merge(database, changes);
	Object.keys(changes).forEach(key => database.markModified(key));

	return await database.save().catch(error => console.error(error));
};