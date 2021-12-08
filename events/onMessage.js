'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { commandHandler, emojiReact } = require('../handlers');

/**
 * @member {events.EventModule} events.onMessage Event handler to automatically add an acknowledgement emoji to messages in any \<NewsChannel>,
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['message'],
	process: [],
	/**
	 * and to call `handlers.commandHandler()` whenever a message is created
	 * @param {'message'} _ The event that was emitted
	 * @param {Discord.Message} msg The created message
	 */
	handler(_, msg) {
		// If the <Message> was created in an announcement channel, automatically apply a checkmark reaction
		if (msg.channel.type === 'news') emojiReact(msg, '✅');

		// Call handlers.commandHandler() to handle a potential command message
		commandHandler(msg);
	},
};