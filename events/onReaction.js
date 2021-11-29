'use strict';

const { manageAttendance, updateUnsubmitted } = require('../handlers');

module.exports = {
	bot: ['messageReactionAdd'],
	process: [],
	async handler(_, reaction, user) {
		if (user.bot) return;

		manageAttendance(reaction, user);
		updateUnsubmitted(reaction, user);
	},
};