'use strict';

const { debugError } = require('../modules');
const { commandHandler } = require('../handlers');

module.exports = {
	bot: ['message'],
	process: [],
	handler(_, msg) {
		if (msg.channel.type === 'news') {
			msg.react('✅').catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));
		}

		commandHandler(msg);
	},
};