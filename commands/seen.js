'use strict';

const Discord = require('discord.js');

const { cmdError, dtg, sendMsg, successReact } = require('../modules');
const { findLesson } = require('../handlers');

module.exports = async guild => {
	const { ids: { lessonsID }, cmds: { seen }, colours } = await require('../handlers/database')(guild);

	seen.execute = async (msg, user) => {
		if (!user.id) successReact(msg);

		const lesson = await findLesson(msg.channel.id);

		const instructor = (user.id)
			? user
			: msg.author;

		try {
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			else if (!lesson) throw 'Invalid lesson channel.';

			else if (!lesson.instructors[instructor.id]) throw 'You are not an instructor for this lesson!';

			else if (lesson.instructors[instructor.id].seen) throw 'You have already acknowledged this lesson warning.';
		}

		catch (error) { return cmdError(msg, error, seen.error); }

		const seenEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setFooter(await dtg());
			.setDescription(`**${await guild.members.fetch(instructor.id).then(member => member.displayName)}** has confirmed receipt of this lesson warning.`)
		sendMsg(msg.channel, { embeds: [seenEmbed] });

		lesson.instructors[instructor.id].seen = true;
		lesson.markModified('instructors');

		let allSeen = true;

		for (const value of Object.values(lesson.instructors)) {
			if (!value.seen) allSeen = false;
		}

		if (allSeen) {
			const allSeenEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setDescription('All instructors have acknowledged receipt of this lesson warning.')
				.setFooter(await dtg());
			sendMsg(msg.channel, { embeds: [allSeenEmbed] });
		}

		return await lesson.save().catch(error => console.error(error));
	};

	return seen;
};