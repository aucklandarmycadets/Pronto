'use strict';

const { ids: { defaultServer } } = require('../config');

module.exports = async (guild, changes) => {
	const Guild = require('../models/guild');
	const { newGuild } = require('./');

	const id = (guild)
		? guild.id
		: defaultServer;

	let database = await Guild.findOne({ guildID: id }, error => {
		if (error) console.error(error);
	});

	if (!changes) return database || await newGuild(guild);

	if (changes instanceof Object) database = merge(database, changes);

	await database.save();
};

function merge(target, source) {
	for (const key of Object.keys(source)) {
		if (source[key] instanceof Object) Object.assign(source[key], merge(target[key], source[key]));
	}

	Object.assign(target || {}, source);
	return target;
}