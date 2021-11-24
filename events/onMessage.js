'use strict';

const { emojiReact } = require('../modules');
const { commandHandler } = require('../handlers');

module.exports = {
	bot: ['message'],
	process: [],
	handler(_, msg) {
		if (msg.channel.type === 'news') emojiReact(msg, '✅');

		commandHandler(msg);
	},
};