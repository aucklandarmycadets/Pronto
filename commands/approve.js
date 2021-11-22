'use strict';

const Discord = require('discord.js');

const { cmdError, debugError, dtg, outputResources, sendMsg, successReact } = require('../modules');
const { findLesson } = require('../handlers');

module.exports = async guild => {
	const { ids: { lessonsID, lessonPlansID }, cmds: { approve }, colours } = await require('../handlers/database')(guild);

	approve.execute = async (msg, user) => {
		const lesson = await findLesson(msg.channel.id);

		try {
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			else if (!lesson) throw 'Invalid lesson channel.';

			else if (lesson.approved) throw 'This lesson has already been approved.';

			else if (!lesson.submitted) throw 'This lesson has not yet been submitted by the instructor(s).';

			else if (lesson.changed) throw 'There are currently unsubmitted changes.';
		}

		catch (error) {
			// If approve is triggered by reaction, ensure msg has the correct author properties (reacter, not submitter)
			msg = (user)
				? msg
				: {
					guild: msg.guild,
					author: await msg.guild.members.fetch(user.id).user,
					member: await msg.guild.members.fetch(user.id),
					channel: msg.channel,
					deleted: true,
				};

			return cmdError(msg, error, approve.error);
		}

		const lessonPlansChnl = msg.guild.channels.cache.get(lessonPlansID);
		if (!user.id) successReact(msg);

		const submitEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.success)
			.setTitle(`Lesson Plan - ${lesson.lessonName}`)
			.addField('Instructor(s)', processMentions(lesson.instructors))
			.addField('Lesson', lesson.lessonName)
			.addField('Lesson Plan Due', lesson.dueDate)
			.addField('Lesson Date', lesson.lessonDate)
			.setFooter(await dtg());
			.addField('Resources', outputResources(lesson.submittedResources, true))

		if (!lesson.archiveID) {
			sendMsg(lessonPlansChnl, { embeds: [submitEmbed] })
				.then(async archiveMsg => {
					lesson.archiveID = archiveMsg.id;
					await lesson.save().catch(error => console.error(error));
				});
		}

		else {
			let archiveMsg, before;

			while (!archiveMsg) {
				await lessonPlansChannel.messages.fetch({ limit: 100, before })
					.then(msgs => {
						archiveMsg = msgs.get(lesson.archiveID);
						before = msgs.last().id;
					})
					.catch(error => debugError(error, `Error fetching messages in ${lessonPlansChannel}.`));
			}
			archiveMsg.edit(submitEmbed);
		}

		const approver = (user.id)
			? user
			: msg.author;

		const approvedEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setDescription(`${approver} has approved this lesson plan.`)
			.setFooter(await dtg());
		sendMsg(msg.channel, { embeds: [approvedEmbed] });

		lesson.approved = true;
		return await lesson.save().catch(error => console.error(error));
	};

	return approve;
};

function processMentions(obj) {
	return Object.values(obj)
		.reduce((mentions, user) => mentions + `<@!${user.id}>\n`, '')
		.replace(/\n+$/, '');
}