'use strict';

const { capitalise, embedScaffold, js } = require('../modules');

module.exports = {
	events: ['error', 'invalidated', 'warn'],
	process: ['unhandledRejection', 'uncaughtExceptionMonitor'],
	async execute(event, info) {
		const { colours } = await require('../handlers/database')();

		const errorEvents = ['error', 'unhandledRejection', 'uncaughtExceptionMonitor'];

		console.error(`${capitalise(event)}:\n`, info);
		if (errorEvents.includes(event)) return embedScaffold(null, 'An unknown error has occured!', colours.error, 'debug', null, null, js(info.stack));
	},
};