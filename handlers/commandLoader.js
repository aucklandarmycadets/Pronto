'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const fs = require('fs');

/**
 * Load the bot's \<Commands> from the commands directory for a specified guild
 * @function handlers.commandLoader
 * @param {string} directory The directory to load each \<Command> from
 * @param {Discord.Guild} guild The \<Guild> to load \<Commands> for
 * @returns {Promise<Typings.Commands>} The loaded \<Commands> object for the guild, containing each \<Command> in a nested object
 */
module.exports = async (directory, guild) => {
	// Read the file names of every Javascript file in the directory, other than the index and <CommandsBase> schematic files
	const files = fs.readdirSync(directory).filter(file => file.endsWith('.js') && !['index.js', 'commands.js'].includes(file));

	// Initialise an empty commands object
	const commandsObj = {};

	// Loop through each <Command> file name
	for (const file of files) {
		// Parse the <CommandName> by removing the file extension
		const command = file.replace('.js', '');
		// Load each <Command> by passing the guild into each command file's exported function
		// Store each indiviudal <Command> as a [key, value] pair within the <Commands> object, where the key is the <CommandName> and the value is the <Command> object
		commandsObj[command] = await require(`.${directory}/${command}`)(guild);
	}

	// Return the loaded <Commands> object
	return commandsObj;
};