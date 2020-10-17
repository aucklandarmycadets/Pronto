const { colours } = require('../config');
const { capitalise, embedScaffold } = require('../modules');

module.exports = {
	events: ['error', 'invalidated', 'warn'],
	process: ['unhandledRejection', 'uncaughtExceptionMonitor'],
	execute(event, info) {
		const errorEvents = ['error', 'unhandledRejection', 'uncaughtExceptionMonitor'];

		console.log(`${capitalise(event)}: `, info);
		if (errorEvents.includes(event)) return embedScaffold(null, 'An unknown error has occured!', colours.error, 'debug', null, null, `\`\`\`js\n${info.stack}\`\`\``);
	},
};