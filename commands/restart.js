'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { successReact } = require('../modules');

/**
 * Complete the \<Command> object from a \<CommandBase>
 * @module commands/restart
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { commands: { restart } } = await require('../handlers/database')(guild);

	/**
	 * End the current bot process
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	restart.execute = ({ msg }) => {
		// Success react to command message
		successReact(msg);
		// Emit a Process#SIGINT event
		process.emit('SIGINT');
	};

	return restart;
};