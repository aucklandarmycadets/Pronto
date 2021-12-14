'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { manageAttendance, updateUnsubmitted } = require('../handlers');

/**
 * @member {events.EventModule} events.onReactionAdd Event handler to trigger [`handlers.manageAttendance()`]{@link handlers.manageAttendance} and [`handlers.updateUnsubmitted()`]{@link handlers.updateUnsubmitted}
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['messageReactionAdd'],
	process: [],
	/**
	 * whenever a reaction is added to a cached \<Message>
	 * @param {'messageReactionAdd'} _ The event that was emitted
	 * @param {Discord.MessageReaction} reaction The reaction object
	 * @param {Discord.User} user The \<User> that applied the guild or reaction emoji
	 */
	async handler(_, reaction, user) {
		// If the reacting <User> is a bot, or if the reaction was applied to a direct message, cease further execution
		if (user.bot || !reaction.message.guild) return;

		// Call handlers.manageAttendance() to process a potential reaction on an attendance register
		manageAttendance(reaction, user);
		// Call handlers.updateUnsubmitted() to process a potential reaction to update the embed displaying all current unsubmitted lessons
		updateUnsubmitted(reaction, user);
	},
};