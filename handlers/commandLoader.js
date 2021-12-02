'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const fs = require('fs');

/**
 * Load the bot's commands from the commands directory for a specified guild
 * @function handlers.commandLoader
 * @param {string} directory The directory to load commands from
 * @param {Discord.Guild} guild The \<Guild> to load commands for
 * @returns {Promise<Object.<string, Object.<string, string | string[] | boolean | Function>>>} The loaded commands object containing each of the guild's commands in a nested object
 */
module.exports = async (directory, guild) => {
	// Read the file names of every Javascript file in the directory, other than the index file
	const files = fs.readdirSync(directory).filter(file => file.endsWith('.js') && file !== 'index.js');

	// Initialise an empty commands object
	const commandsObj = {};

	// Loop through each command file
	for (const file of files) {
		// Parse the command name by removing the file extension
		const command = file.replace('.js', '');
		// Load each command by passing the guild into each command file's exported function
		// This completes the individual command's object by adding the command.execute() function to the command object
		// Store each indiviudal command as a [key, value] pair within the commands object, where the key is the command name and the value is the command object
		commandsObj[command] = await require(`.${directory}/${command}`)(guild);
	}

	// Return the loaded commands object
	return commandsObj;
};