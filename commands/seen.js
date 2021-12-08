'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup } = require('../modules');
const { commandError, database, findLesson, sendMsg, successReact } = require('../handlers');

/**
 * @member {commands.Command} commands.seen
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { lessonsID }, commands: { seen }, colours } = await database(guild);

	/**
	 * Acknowledge a lesson warning, either from a message command or a message reaction

	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 * @returns {Promise<Typings.Lesson>} The mongoose document for the lesson
	 */
	seen.execute = async ({ msg, user }) => {
		// Find <Lesson> document by querying database for lesson channel ID
		const lessonDocument = await findLesson(msg.channel.id);

		// Resolve the instructor, depending on whether executed via command or reaction
		const instructor = user || msg.author;

		try {
			// Ensure message channel is contained within lessons category
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			// Ensure <Lesson> has been found
			else if (!lessonDocument) throw 'Invalid lesson channel.';

			// Ensure the resolved instructor is an instructor of the lesson
			else if (!lessonDocument.instructors[instructor.id]) throw 'You are not an instructor for this lesson!';

			// Ensure the instructor has not already acknowledged receipt
			else if (lessonDocument.instructors[instructor.id].seen) throw 'You have already acknowledged this lesson warning.';
		}

		catch (error) { return commandError(msg, error, seen.error); }

		// Success react if executed via command
		if (!user) successReact(msg);

		// Create seen embed
		const seenEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setDescription(`**${await guild.members.fetch(instructor.id).then(member => member.displayName)}** has confirmed receipt of this lesson warning.`)
			.setFooter(await dateTimeGroup());

		// Send the seen embed
		sendMsg(msg.channel, { embeds: [seenEmbed] });

		// Change the instructor's seen status in the database
		lessonDocument.instructors[instructor.id].seen = true;
		lessonDocument.markModified('instructors');

		// Check whether all instructors have been marked as having acknowledged receipt of the lesson warning
		const allSeen = Object.values(lessonDocument.instructors).every(_instructor => _instructor.seen);

		if (allSeen) {
			// If so, create and send an embed to state that all instructors have acknowledged receipt
			const allSeenEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setDescription('All instructors have acknowledged receipt of this lesson warning.')
				.setFooter(await dateTimeGroup());
			sendMsg(msg.channel, { embeds: [allSeenEmbed] });
		}

		// Save the <Lesson> document and return it
		return await lessonDocument.save().catch(error => console.error(error));
	};

	return seen;
};