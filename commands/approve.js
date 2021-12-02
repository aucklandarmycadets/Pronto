'use strict';

const Discord = require('discord.js');

const { cmdError, debugError, dateTimeGroup, enumerateResources, sendMsg, successReact } = require('../modules');
const { findLesson } = require('../handlers');

/**
 * Attach the cmd.execute() function to command object
 * @module commands/approve
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Object.<string, string | string[] | boolean | Function>>} The complete command object with a cmd.execute() property
 */
module.exports = async guild => {
	const { ids: { lessonsID, lessonPlansID }, cmds: { approve }, colours } = await require('../handlers/database')(guild);

	/**
	 * Approve a submitted lesson plan in a lesson channel, either from a message command or a message reaction
	 * @param {Discord.Message} msg The \<Message> that either executed the approve command, or the \<Message> that the reaction collector was attached to
	 * @param {string[] | Discord.User} user The command arguments, or a possible \<User> that will exist if the command was triggered by a reaction collector
	 * @returns {Promise<Object.<string, *>>} The mongoose document for the lesson
	 */
	approve.execute = async (msg, user) => {
		// Find <Lesson> document by querying database for lesson channel ID
		const lesson = await findLesson(msg.channel.id);

		try {
			// Ensure message channel is contained within lessons category
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			// Ensure <Lesson> has been found
			else if (!lesson) throw 'Invalid lesson channel.';

			// Ensure lesson has not already been approved
			else if (lesson.approved) throw 'This lesson has already been approved.';

			// Ensure lesson has been submitted and is awaiting approval
			else if (!lesson.submitted) throw 'This lesson has not yet been submitted by the instructor(s).';

			// Ensure there have not been any changes since previous submission
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

		// Success react if executed via command
		if (!user.id) successReact(msg);

		// Get the master lesson plans channel
		const lessonPlansChannel = msg.guild.channels.cache.get(lessonPlansID);

		// Create lesson submission embed
		const submissionEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.success)
			.setTitle(`Lesson Plan - ${lesson.lessonName}`)
			.addField('Instructor(s)', processMentions(lesson.instructors))
			.addField('Lesson', lesson.lessonName)
			.addField('Lesson Plan Due', lesson.dueDate)
			.addField('Lesson Date', lesson.lessonDate)
			.addField('Resources', enumerateResources(lesson.submittedResources, true))
			.setFooter(await dateTimeGroup());

		// If lesson has not yet been archived in the master channel, send a copy into the channel
		if (!lesson.archiveID) {
			sendMsg(lessonPlansChannel, { embeds: [submissionEmbed] })
				.then(async archiveMsg => {
					// Record the archived message's ID
					lesson.archiveID = archiveMsg.id;
					await lesson.save().catch(error => console.error(error));
				});
		}

		// If the lesson has previously been archived and has been updated, update the original message
		else {
			let archiveMsg, before;

			// Filter messages in the archive channel for the archived message's ID
			while (!archiveMsg) {
				// Fetch messages in blocks of 100 (maximum allowed by the API) moving back in time until archive message is found
				await lessonPlansChannel.messages.fetch({ limit: 100, before })
					.then(msgs => {
						// Attempt to find the message matching the archived message's ID
						archiveMsg = msgs.get(lesson.archiveID);

						// Update oldest message ID
						before = msgs.last().id;
					})
					.catch(error => debugError(error, `Error fetching messages in ${lessonPlansChannel}.`));
			}

			// Edit the archived message
			archiveMsg.edit(submissionEmbed);
		}

		// Resolve the approving user, depending on whether executed via command or reaction
		const approver = (user.id)
			? user
			: msg.author;

		// Create lesson approval embed
		const approvedEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setDescription(`${approver} has approved this lesson plan.`)
			.setFooter(await dateTimeGroup());

		// Send lesson approval embed
		sendMsg(msg.channel, { embeds: [approvedEmbed] });

		// Mark lesson as approved in database
		lesson.approved = true;
		// Save the <Lesson> document and return it
		return await lesson.save().catch(error => console.error(error));
	};

	return approve;
};

/**
 * Process an object containing users with an ID child property into a formatted string
 * @param {Object.<string, {id: string}>} obj An object where each key stores a nested object with a property 'id'
 * - e.g. const obj = {'192181901065322496': { 'id': '192181901065322496', ... }, ...}
 * @returns {string} A newline-delimited string of formatted user mentions
 */
function processMentions(obj) {
	// Map the nested objects to a new string[] of formatted mentions, then join the string[] with a newline separator
	return Object.values(obj)
		.map(user => `<@!${user.id}>`)
		.join('\n');
}