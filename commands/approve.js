'use strict';

const Discord = require('discord.js');

const { cmdError, debugError, dtg, outputResources, sendMsg } = require('../modules');
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
			if (user) {
				const _msg = {
					guild: msg.guild,
					author: msg.guild.members.cache.get(user.id).user,
					member: msg.guild.members.cache.get(user.id),
					channel: msg.channel,
					deleted: true,
				};
			}

			return cmdError(_msg, error, approve.error);
		}

		const lessonPlansChnl = msg.guild.channels.cache.get(lessonPlansID);

		const submitEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.success)
			.setTitle(`Lesson Plan - ${lesson.lessonName}`)
			.addField('Instructor(s)', processMentions(lesson.instructors))
			.addField('Lesson', lesson.lessonName)
			.addField('Lesson Plan Due', lesson.dueDate)
			.addField('Lesson Date', lesson.lessonDate)
			.addField('Resources', outputResources(lesson.submittedResources), 1024)
			.setFooter(await dtg());

		if (!lesson.archiveID) {
			sendMsg(lessonPlansChnl, submitEmbed)
				.then(async archiveMsg => {
					lesson.archiveID = archiveMsg.id;
					await lesson.save().catch(error => console.error(error));
				});
		}

		else {
			let archiveMsg;
			const filterBy = _msg => _msg.id === lesson.archiveID;

			await lessonPlansChnl.messages.fetch()
				.then(msgs => {
					archiveMsg = msgs.filter(filterBy).first();
				})
				.catch(error => debugError(error, `Error fetching messages in ${lessonPlansChnl}.`));

			archiveMsg.edit(submitEmbed);
		}

		const approver = (user.id)
			? user
			: msg.author;

		const approvedEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setDescription(`${approver} has approved this lesson plan.`)
			.setFooter(await dtg());
		sendMsg(msg.channel, approvedEmbed);

		lesson.approved = true;
		return await lesson.save().catch(error => console.error(error));
	};

	return approve;
};

function processMentions(obj) {
	let mentions = '';
	for (const mention of Object.values(obj)) { mentions += `<@!${mention.id}>\n`; }
	return mentions.replace(/\n+$/, '');
}