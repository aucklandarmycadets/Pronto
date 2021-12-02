'use strict';

const { Guild } = require('../models');

const { ids: { defaultServer } } = require('../config');
const { merge } = require('../modules');

module.exports = async (guild, changes) => {
	const { newGuild } = require('./');

	const id = (guild)
		? guild.id
		: defaultServer;

	let database = await Guild.findOne({ guildID: id }, error => {
		if (error) console.error(error);
	});

	if (!changes) return database || await newGuild(guild);

	if (changes instanceof Object) database = merge(database, changes);
	Object.keys(changes).forEach(key => database.markModified(key));

	return await database.save().catch(error => console.error(error));
};