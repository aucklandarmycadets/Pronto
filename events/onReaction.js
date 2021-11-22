'use strict';

const { manageAttendance, updateUnsubmitted } = require('../handlers');

module.exports = {
	events: ['messageReactionAdd'],
	process: [],
	async handler(_, reaction, user) {
		if (user.bot) return;
		if (reaction.partial) await reaction.fetch();

		manageAttendance(reaction, user);
		updateUnsubmitted(reaction, user);
	},
};