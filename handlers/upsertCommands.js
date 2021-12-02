'use strict';

const { ids: { DEFAULT_GUILD } } = require('../config');
const { difference, merge } = require('../modules');

module.exports = async guild => {
	const { Guild } = require('../models');
	const updatedCommands = await require('../commands')(guild);

	const id = (guild)
		? guild.id
		: DEFAULT_GUILD;

	const database = await Guild.findOne({ guildID: id }, error => {
		if (error) console.error(error);
	});

	database.commands = await process(updatedCommands, database);
	database.markModified('commands');

	return await database.save().catch(error => console.error(error));
};

async function process(updatedCommands, database) {
	const commandsArray = Object.keys(updatedCommands);
	const databaseArray = Object.keys(database.commands);

	const diff = difference(commandsArray, databaseArray);

	if (diff.length) {
		for (let i = 0; i < diff.length; i++) {
			if (commandsArray.includes(diff[i])) database.commands[diff[i]] = updatedCommands[diff[i]];
			else if (databaseArray.includes(diff[i])) delete database.commands[diff[i]];
		}
	}

	// A string[] of the command object properties which may differ across each guild
	const guildProperties = ['requiredRoles', 'deniedRoles', 'allowDM', 'showList'];

	// Use Object.fromEntries() to create a sanitised commands object, where each command object is stripped of any guild-specific keys if they already exist in the guild's database
	const sanitisedCommands = Object.fromEntries(
		Object.entries(updatedCommands).map(([command, commandObj]) => {
			// If the guild already has the command registered in its database, delete the guild modifiable properties from the updated command object
			if (database.commands[command]) guildProperties.forEach(guildProperty => delete commandObj[guildProperty]);

			// Map to an array of key-value entries where each command name is a key and each updated command object is the corresponding value
			// This is used by Object.fromEntries() to create the updated (and sanitised) commands object
			return [command, commandObj];
		}),
	);

	return merge(database.commands, sanitisedCommands);
}