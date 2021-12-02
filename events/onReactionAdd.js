'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { manageAttendance, updateUnsubmitted } = require('../handlers');

module.exports = {
	bot: ['messageReactionAdd'],
	process: [],
	/**
	 * Event handler to trigger handlers.manageAttendance() and handlers.updateUnsubmitted()
	 * whenever a reaction is added to a cached \<Message>
	 * @param {'messageReactionAdd'} _ The event that was emitted
	 * @param {Discord.MessageReaction} reaction The reaction object
	 * @param {Discord.User} user The \<User> that applied the guild or reaction emoji
	 */
	async handler(_, reaction, user) {
		// If the reacting <user> is a bot, cease further execution
		if (user.bot) return;

		// Call handlers.manageAttendance() to process a potential reaction on an attendance register
		manageAttendance(reaction, user);
		// Call handlers.updateUnsubmitted() to process a potential reaction to update the embed displaying all current unsubmitted lessons
		updateUnsubmitted(reaction, user);
	},
};