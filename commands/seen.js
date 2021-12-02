'use strict';

const Discord = require('discord.js');

const { commandError, dateTimeGroup, sendMsg, successReact } = require('../modules');
const { findLesson } = require('../handlers');

/**
 * Attach the command.execute() function to command object
 * @module commands/seen
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Object.<string, string | string[] | boolean | Function>>} The complete command object with a command.execute() property
 */
module.exports = async guild => {
	const { ids: { lessonsID }, commands: { seen }, colours } = await require('../handlers/database')(guild);

	/**
	 * Acknowledge a lesson warning, either from a message command or a message reaction
	 * @param {Discord.Message} msg The \<Message> that either executed the approve command, or the \<Message> that the reaction collector was attached to
	 * @param {string[] | Discord.User} user The command arguments, or a possible \<User> that will exist if the command was triggered by a reaction collector
	 * @returns {Promise<Lesson>} The mongoose document for the lesson
	 */
	seen.execute = async (msg, user) => {
		// Find <Lesson> document by querying database for lesson channel ID
		const lesson = await findLesson(msg.channel.id);

		// Resolve the instructor, depending on whether executed via command or reaction
		const instructor = (user.id)
			? user
			: msg.author;

		try {
			// Ensure message channel is contained within lessons category
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			// Ensure <Lesson> has been found
			else if (!lesson) throw 'Invalid lesson channel.';

			// Ensure the resolved instructor is an instructor of the lesson
			else if (!lesson.instructors[instructor.id]) throw 'You are not an instructor for this lesson!';

			// Ensure the instructor has not already acknowledged receipt
			else if (lesson.instructors[instructor.id].seen) throw 'You have already acknowledged this lesson warning.';
		}

		catch (error) { return commandError(msg, error, seen.error); }

		// Success react if executed via command
		if (!user.id) successReact(msg);

		// Create seen embed
		const seenEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setDescription(`**${await guild.members.fetch(instructor.id).then(member => member.displayName)}** has confirmed receipt of this lesson warning.`)
			.setFooter(await dateTimeGroup());

		// Send the seen embed
		sendMsg(msg.channel, { embeds: [seenEmbed] });

		// Change the instructor's seen status in the database
		lesson.instructors[instructor.id].seen = true;
		lesson.markModified('instructors');

		// Check whether all instructors have been marked as having acknowledged receipt of the lesson warning
		const allSeen = Object.values(lesson.instructors).every(_instructor => _instructor.seen);

		if (allSeen) {
			// If so, create and send an embed to state that all instructors have acknowledged receipt
			const allSeenEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setDescription('All instructors have acknowledged receipt of this lesson warning.')
				.setFooter(await dateTimeGroup());
			sendMsg(msg.channel, { embeds: [allSeenEmbed] });
		}

		// Save the <Lesson> document and return it
		return await lesson.save().catch(error => console.error(error));
	};

	return seen;
};