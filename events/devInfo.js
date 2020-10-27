'use strict';

const { colours } = require('../config');
const { capitalise, embedScaffold, js } = require('../modules');

module.exports = {
	events: ['error', 'invalidated', 'warn'],
	process: ['unhandledRejection', 'uncaughtExceptionMonitor'],
	execute(event, info) {
		const errorEvents = ['error', 'unhandledRejection', 'uncaughtExceptionMonitor'];

		console.error(`${capitalise(event)}: \n${info} \n${info.stack}`);
		if (errorEvents.includes(event)) return embedScaffold(null, 'An unknown error has occured!', colours.error, 'debug', null, null, js(info.stack));
	},
};