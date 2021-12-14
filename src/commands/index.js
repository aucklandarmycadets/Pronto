'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const fs = require('fs');

/**
 * @namespace commands
 */

/**
 * Load the commands folder for the specified guild
 * @param {Discord.Guild} guild The \<Guild> to load the \<Commands> for
 * @returns {Promise<Typings.Commands>} The guild's complete \<Commands> object
 */
module.exports = async guild => await commandLoader('./commands', guild);

/**
 * Load the bot's \<Commands> from the specified directory for a specified guild
 * @function commands.index~commandLoader
 * @param {string} directory The directory to load each \<Command> from
 * @param {Discord.Guild} guild The \<Guild> to load \<Commands> for
 * @returns {Promise<Typings.Commands>} The loaded \<Commands> object for the guild, containing each \<Command> in a nested object
 */
async function commandLoader(directory, guild) {
	// Read the file names of every JavaScript file in the directory, other than the index and <BaseCommands> schematic files
	const files = fs.readdirSync(directory).filter(file => file.endsWith('.js') && !['index.js', 'commands.js'].includes(file));

	// Initialise an empty commands object
	const commandsObject = {};

	// Loop through each <Command> file name
	for (const file of files) {
		// Parse the <CommandName> by removing the file extension
		const command = file.replace('.js', '');
		// Load each <Command> by passing the guild into each command file's exported function
		// Store each individual <Command> as a [key, value] pair within the <Commands> object, where the key is the <CommandName> and the value is the <Command> object
		commandsObject[command] = await require(`.${directory}/${command}`)(guild);
	}

	// Return the loaded <Commands> object
	return commandsObject;
}