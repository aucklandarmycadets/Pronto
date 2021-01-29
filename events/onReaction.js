'use strict';

const { manageAttendance } = require('../handlers');

module.exports = {
	events: ['messageReactionAdd'],
	process: [],
	async execute(_, reaction, user) {
		if (user.bot) return;
		if (reaction.partial) await reaction.fetch();

		manageAttendance(reaction, user);
	},
};