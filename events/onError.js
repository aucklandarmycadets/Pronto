'use strict';

const { embedScaffold, jsCodeBlock } = require('../modules');

module.exports = {
	bot: ['error', 'warn'],
	process: ['unhandledRejection', 'uncaughtExceptionMonitor'],
	/**
	 * Event handler for \<Discord.Client> and \<NodeJS.Process> events which may be useful for debugging
	 * @param {'error' | 'warn' | 'unhandledRejection' | 'uncaughtExceptionMonitor'} event The event that was emitted
	 * @param {Error | string | *} error The \<Error> that was enountered, or a \<string> if emitted by \<Discord.Client>#warn
	 * - \<any> may be emitted by \<NodeJS.Process>#unhandledRejection, but it is typically an \<Error>
	 */
	async handler(event, error) {
		const { colours } = await require('../handlers/database')();

		// If error is an <Error> with a stack, reassign the variable
		// Only do this if the stack is actually present, and not if it is a regular <string> or <*>
		if (error.stack) error = error.stack;

		// Print the <Error> to console with console.error() along with the emitted event
		console.error(`'${event}':\n\n${error}`);

		// Unless the event is a warning, also send an error embed to the guild's debugging channel
		if (event !== 'warn') embedScaffold(null, null, 'An unknown error has occured!', colours.error, 'DEBUG', null, null, jsCodeBlock(error));
	},
};