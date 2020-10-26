'use strict';

const { debugError } = require('../modules');
const { commandHandler } = require('../handlers');

module.exports = {
	events: ['message'],
	process: [],
	execute(event, msg) {
		if (msg.channel.type === 'news') {
			msg.react('✅').catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));
		}

		commandHandler(msg);
	},
};