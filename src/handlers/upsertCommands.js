'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { Guild } = require('../models');
const { difference, merge } = require('../modules');

/**
 * @function handlers.upsertCommands
 * @param {Discord.Guild} guild
 * @returns {Promise<Typings.GuildConfiguration>}
 */
module.exports = async guild => {
	const updatedCommands = await require('../commands/commands')(guild);

	/**
	 * @type {Typings.GuildConfiguration}
	 */
	const document = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	document.commands = await processChanges(updatedCommands, document);
	document.markModified('commands');

	return await document.save().catch(error => console.error(error));
};

/**
 * @function handlers.upsertCommands~processChanges
 * @param {Typings.BaseCommands} updatedCommands
 * @param {Typings.GuildConfiguration} document
 * @returns {Promise<Typings.BaseCommands>}
 */
async function processChanges(updatedCommands, document) {
	const commandsArray = Object.keys(updatedCommands);
	const databaseArray = Object.keys(document.commands);

	const diff = difference(commandsArray, databaseArray);

	if (diff.length) {
		for (let i = 0; i < diff.length; i++) {
			if (commandsArray.includes(diff[i])) document.commands[diff[i]] = updatedCommands[diff[i]];
			else if (databaseArray.includes(diff[i])) delete document.commands[diff[i]];
		}
	}

	// A string[] of the <BaseCommand> properties which may differ across each guild
	const guildProperties = ['requiredRoles', 'deniedRoles', 'allowDirect', 'displayInList'];

	// Use Object.fromEntries() to create a sanitised object, where each <BaseCommand> object is stripped of any guild-specific keys if they already exist in the guild's database
	const sanitisedCommands = Object.fromEntries(
		Object.entries(updatedCommands).map(([command, commandObject]) => {
			// If the guild already has the <BaseCommand> registered in its database, delete the guild modifiable properties from the updated <BaseCommand> object
			if (document.commands[command]) guildProperties.forEach(guildProperty => delete commandObject[guildProperty]);

			// Map to an array of key-value entries where each <CommandName> is a key and each updated <BaseCommand> object is the corresponding value
			// This is used by Object.fromEntries() to create the updated (and sanitised) <BaseCommands>-derived object
			return [command, commandObject];
		}),
	);

	return merge(document.commands, sanitisedCommands);
}