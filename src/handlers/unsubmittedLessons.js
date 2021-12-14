'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const dateFormat = require('dateformat');

const { Lesson } = require('../models');
const { dateTimeGroup } = require('../modules');
const { emojiReact, findGuildConfiguration, sendMsg } = require('../handlers');

/** */

/**
 *
 * @function handlers.unsubmittedLessons
 * @param {Discord.Guild} guild The guild to update lessons for
 */
module.exports = async guild => {
	const { settings: { shortDate }, ids: { lessonReferenceId }, colours } = await findGuildConfiguration(guild);

	/**
	 * @type {Typings.Lesson[]}
	 */
	const unsubmitted = await Lesson.find({ submitted: false }).sort({ dueTimestamp: 'ascending' }).exec()
		.catch(error => console.error(error));

	const embedTitle = 'Lessons To Be Submitted';

	const unsubmittedEmbed = new Discord.MessageEmbed()
		.setColor(colours.primary)
		.setTitle(embedTitle)
		.setAuthor(guild.name, guild.iconURL({ dynamic: true }))
		.setFooter(`Last updated at ${await dateTimeGroup()}`);

	if (!unsubmitted.length) {
		/**
		 * @type {Typings.Lesson[]}
		 */
		const lessons = await Lesson.find().exec()
			.catch(error => console.error(error));

		if (!lessons.length) return;

		unsubmittedEmbed.setDescription('All lesson plans have been submitted!');
	}

	else if (unsubmitted.length) {
		for (const lesson of unsubmitted) {
			try {
				const lessonChannel = guild.channels.cache.get(lesson.lessonId);
				const lastMessage = await lessonChannel.messages.fetch(lessonChannel.lastMessageId);
				const channelURL = lastMessage.url.split('/').slice(0, -1).join('/');

				const dueString = `Due \`${dateFormat(lesson.dueTimestamp, shortDate)}\` — `;

				for (const instructor of Object.values(lesson.instructors)) {
					const instructorMember = await guild.members.fetch(instructor.id);

					if (!instructorMember || !lessonChannel) continue;

					const instructorField = unsubmittedEmbed.fields.find(field => field.name === instructorMember.displayName);

					(instructorField)
						? instructorField.value += `${dueString} [${lesson.lessonName}](${channelURL})\n`
						: unsubmittedEmbed.addField(instructorMember.displayName, `${dueString} [${lesson.lessonName}](${channelURL})\n`);
				}
			}
			catch { continue; }
		}
	}

	const referenceChannel = guild.channels.cache.get(lessonReferenceId);
	await referenceChannel.messages.fetch();

	const existingMsg = referenceChannel.messages.cache.find(msg => {
		return (msg.embeds[0])
			? (msg.embeds[0].title)
				? (msg.embeds[0].title === embedTitle)
				: false
			: false;
	});

	if (!existingMsg) emojiReact(await sendMsg(referenceChannel, { embeds: [unsubmittedEmbed] }), '🔄');

	else existingMsg.edit(unsubmittedEmbed);
};