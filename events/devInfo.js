'use strict';

const { capitalise, embedScaffold, js } = require('../modules');

module.exports = {
	bot: ['error', 'warn'],
	process: ['unhandledRejection', 'uncaughtExceptionMonitor'],
	async handler(event, info) {
		const { colours } = await require('../handlers/database')();

		const errorEvents = ['error', 'unhandledRejection', 'uncaughtExceptionMonitor'];

		console.error(`${capitalise(event)}:\n`, info);
		if (errorEvents.includes(event)) return embedScaffold(null, null, 'An unknown error has occured!', colours.error, 'debug', null, null, js(info.stack));
	},
};