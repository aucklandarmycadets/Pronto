'use strict';

const Discord = require('discord.js');
const dateFormat = require('dateformat');

const Lesson = require('../models/lesson');

const { dtg, emojiReact, sendMsg } = require('../modules');

module.exports = async guild => {
	const { config: { shortDate }, ids: { lessonReferenceID }, colours } = await require('../handlers/database')(guild);

	const unsubmitted = await Lesson.find({ submitted: false }).sort({ dueTimestamp: 'ascending' });

	const embedTitle = 'Lessons To Be Submitted';

	const unsubmittedEmbed = new Discord.MessageEmbed()
		.setColor(colours.pronto)
		.setTitle(embedTitle)
		.setAuthor(guild.name, guild.iconURL({ dynamic: true }))
		.setFooter(`Last updated at ${await dtg()}`);

	if (!unsubmitted.length) {
		const lessons = await Lesson.find();
		if (!lessons.length) return;

		unsubmittedEmbed.setDescription('All lesson plans have been submitted!');
	}

	else if (unsubmitted.length) {
		for (const lesson of unsubmitted) {
			try {
				const lessonChannel = guild.channels.cache.get(lesson.lessonID);
				const lastMessage = await lessonChannel.messages.fetch(lessonChannel.lastMessageID);
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

	const referenceChannel = guild.channels.cache.get(lessonReferenceID);
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