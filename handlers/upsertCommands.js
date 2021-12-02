'use strict';

const { ids: { DEFAULT_GUILD } } = require('../config');
const { difference, merge } = require('../modules');

module.exports = async guild => {
	const { Guild } = require('../models');
	const updatedCmds = await require('../cmds')(guild);

	const id = (guild)
		? guild.id
		: DEFAULT_GUILD;

	const database = await Guild.findOne({ guildID: id }, error => {
		if (error) console.error(error);
	});

	database.cmds = await process(updatedCmds, database);
	database.markModified('cmds');

	return await database.save().catch(error => console.error(error));
};

async function process(updatedCmds, database) {
	const cmdsArray = Object.keys(updatedCmds);
	const databaseArray = Object.keys(database.cmds);

	const diff = difference(cmdsArray, databaseArray);

	if (diff.length) {
		for (let i = 0; i < diff.length; i++) {
			if (cmdsArray.includes(diff[i])) database.cmds[diff[i]] = updatedCmds[diff[i]];
			else if (databaseArray.includes(diff[i])) delete database.cmds[diff[i]];
		}
	}

	// A string[] of the command object properties which may differ across each guild
	const guildProperties = ['requiredRoles', 'deniedRoles', 'allowDM', 'showList'];

	// Use Object.fromEntries() to create a sanitised commands object, where each command object is stripped of any guild-specific keys if they already exist in the guild's database
	const sanitisedCmds = Object.fromEntries(
		Object.entries(updatedCmds).map(([cmd, cmdObj]) => {
			// If the guild already has the command registered in its database, delete the guild modifiable properties from the updated command object
			if (database.cmds[cmd]) guildProperties.forEach(guildProperty => delete cmdObj[guildProperty]);

			// Map to an array of key-value entries where each command name is a key and each updated command object is the corresponding value
			// This is used by Object.fromEntries() to create the updated (and sanitised) commands object
			return [cmd, cmdObj];
		}),
	);

	return merge(database.cmds, sanitisedCmds);
}