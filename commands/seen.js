'use strict';

const Discord = require('discord.js');
const Lesson = require('../models/lesson');

const { cmdError, dtg, sendMsg } = require('../modules');

module.exports = async guild => {
	const { ids: { lessonsID }, cmds: { seen }, colours } = await require('../handlers/database')(guild);

	seen.execute = async msg => {
		const lesson = await Lesson.findOne({ lessonID: msg.channel.id }, error => {
			if (error) console.error(error);
		});

		try {
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			else if (!lesson) throw 'Invalid lesson channel.';

			else if (!lesson.instructors[msg.author.id]) throw 'You are not an instructor for this lesson!';

			else if (lesson.instructors[msg.author.id].seen) throw 'You have already acknowledged this lesson warning.';
		}

		catch (error) { return cmdError(msg, error, seen.error); }

		const seenEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setDescription(`${msg.author} has confirmed receipt of this lesson warning.`)
			.setFooter(await dtg());
		sendMsg(msg.channel, seenEmbed);

		lesson.instructors[msg.author.id].seen = true;
		lesson.markModified('instructors');
		await lesson.save().catch(error => console.error(error));

		let allSeen = true;

		for (const value of Object.values(lesson.instructors)) {
			if (!value.seen) allSeen = false;
		}

		if (allSeen) {
			const allSeenEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setDescription('All instructors have acknowledged receipt of this lesson warning.')
				.setFooter(await dtg());
			sendMsg(msg.channel, allSeenEmbed);
		}
	};

	return seen;
};