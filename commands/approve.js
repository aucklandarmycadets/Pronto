'use strict';

const Discord = require('discord.js');
const Lesson = require('../models/lesson');

const { cmdError, debugError, dtg, outputResources, sendMsg } = require('../modules');

module.exports = async guild => {
	const { ids: { lessonsID, lessonPlansID }, cmds: { approve }, colours } = await require('../handlers/database')(guild);

	approve.execute = async msg => {
		const lesson = await Lesson.findOne({ lessonID: msg.channel.id }, error => {
			if (error) console.error(error);
		});

		try {
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			else if (!lesson) throw 'Invalid lesson channel.';

			else if (lesson.approved) throw 'This lesson has already been approved.';

			else if (lesson.changed) throw 'There are currently unsubmitted changes.';
		}

		catch (error) { return cmdError(msg, error, approve.error); }

		const lessonPlansChnl = msg.guild.channels.cache.get(lessonPlansID);

		const submitEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
			.setColor(colours.success)
			.setTitle(`Lesson Plan Submitted - ${lesson.lessonName}`)
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
			const filterBy = message => message.id === lesson.archiveID;

			await lessonPlansChnl.messages.fetch()
				.then(messages => {
					archiveMsg = messages.filter(filterBy).first();
				})
				.catch(error => debugError(error, `Error fetching messages in ${lessonPlansChnl}.`));

			archiveMsg.edit(submitEmbed);
		}

		const approvedEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setDescription(`${msg.author} has approved this lesson plan.`)
			.setFooter(await dtg());
		sendMsg(msg.channel, approvedEmbed);

		lesson.approved = true;
		await lesson.save().catch(error => console.error(error));
	};

	return approve;
};

function processMentions(obj) {
	let mentions = '';
	for (const mention of Object.values(obj)) { mentions += `<@!${mention.id}>\n`; }
	return mentions.replace(/\n+$/, '');
}