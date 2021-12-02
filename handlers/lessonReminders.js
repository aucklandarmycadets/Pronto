'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const cron = require('node-cron');

const { Lesson } = require('../models');
const { dateTimeGroup, sendMsg } = require('../modules');

module.exports = async guild => {
	const { settings: { lessonCron, lessonReminders }, ids: { archivedID }, colours } = await require('../handlers/database')(guild);

	cron.schedule(lessonCron, async () => {
		/**
		 * @type {Typings.Lesson[]}
		 */
		const unsubmitted = await Lesson.find({ submitted: false, dueTimestamp: { $gte: Date.now(), $lte: new Date().setDate(new Date().getDate() + 8).valueOf() } });

		for (const lesson of unsubmitted) {
			const lessonChannel = guild.channels.cache.get(lesson.lessonID);

			if (lessonChannel.parentID === archivedID) continue;

			const remindEmbed = new Discord.MessageEmbed()
				.setTitle('Lesson Reminder')
				.setColor(colours.warn)
				.setDescription(`Reminder — your lesson plan is due at \`${lesson.dueDate}\`.`)
				.setFooter(await dateTimeGroup());

			if (lesson.dueTimestamp - Date.now() <= 86400000) remindEmbed.setColor(colours.error);

			sendMsg(lessonChannel, { content: Object.keys(lesson.instructors).map(id => `<@!${id}>`).join(' '), embeds: [remindEmbed] });
		}
	}, {
		scheduled: lessonReminders,
		timezone: 'Pacific/Auckland',
	});
};