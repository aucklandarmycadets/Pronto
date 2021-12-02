'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { successReact } = require('../modules');

/**
 * Attach the cmd.execute() function to command object
 * @module commands/restart
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Object.<string, string | string[] | boolean | Function>>} The complete command object with a cmd.execute() property
 */
module.exports = async guild => {
	const { cmds: { restart } } = await require('../handlers/database')(guild);

	/**
	 * End the current bot process
	 * @param {Discord.Message} msg The \<Message> that executed the command
	 */
	restart.execute = msg => {
		// Success react to the command message
		successReact(msg);
		// Emit a Process#SIGINT event
		process.emit('SIGINT');
	};

	return restart;
};