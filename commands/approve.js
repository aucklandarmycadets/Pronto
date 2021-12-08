'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup, enumerateResources } = require('../modules');
const { database, commandError, debugError, findLesson, sendMsg, successReact } = require('../handlers');

/**
 * @member {commands.Command} commands.approve Approve a submitted lesson plan in a lesson channel, either from a message command or a message reaction
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { lessonsID, lessonPlansID }, commands: { approve }, colours } = await database(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 * @returns {Promise<Typings.Lesson>} The mongoose document for the lesson
	 */
	approve.execute = async ({ msg, user }) => {
		// Find <Lesson> document by querying database for lesson channel ID
		const lessonDocument = await findLesson(msg.channel.id);

		try {
			// Ensure message channel is contained within lessons category
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			// Ensure <Lesson> has been found
			else if (!lessonDocument) throw 'Invalid lesson channel.';

			// Ensure lesson has not already been approved
			else if (lessonDocument.approved) throw 'This lesson has already been approved.';

			// Ensure lesson has been submitted and is awaiting approval
			else if (!lessonDocument.submitted) throw 'This lesson has not yet been submitted by the instructor(s).';

			// Ensure there have not been any changes since previous submission
			else if (lessonDocument.changed) throw 'There are currently unsubmitted changes.';
		}

		catch (error) {
			// If approve is triggered by reaction, ensure msg has the correct author properties (approver, not submitter)
			msg = (user)
				? {
					guild: msg.guild,
					author: await msg.guild.members.fetch(user.id).user,
					member: await msg.guild.members.fetch(user.id),
					channel: msg.channel,
					deleted: true,
				}
				: msg;

			return commandError(msg, error, approve.error);
		}

		// Success react if executed via command
		if (!user) successReact(msg);

		// Get the master lesson plans channel
		const lessonPlansChannel = msg.guild.channels.cache.get(lessonPlansID);

		// Create lesson submission embed
		const submissionEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.success)
			.setTitle(`Lesson Plan - ${lessonDocument.lessonName}`)
			.addField('Instructor(s)', processMentions(lessonDocument.instructors))
			.addField('Lesson', lessonDocument.lessonName)
			.addField('Lesson Plan Due', lessonDocument.dueDate)
			.addField('Lesson Date', lessonDocument.lessonDate)
			.addField('Resources', enumerateResources(lessonDocument.submittedResources, true))
			.setFooter(await dateTimeGroup());

		// If lesson has not yet been archived in the master channel, send a copy into the channel
		if (!lessonDocument.archiveID) {
			sendMsg(lessonPlansChannel, { embeds: [submissionEmbed] })
				.then(async archiveMsg => {
					// Record the archived message's ID
					lessonDocument.archiveID = archiveMsg.id;
					await lessonDocument.save().catch(error => console.error(error));
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
						archiveMsg = msgs.get(lessonDocument.archiveID);

						// Update oldest message ID
						before = msgs.last().id;
					})
					.catch(error => debugError(error, `Error fetching messages in ${lessonPlansChannel}.`));
			}

			// Edit the archived message
			archiveMsg.edit(submissionEmbed);
		}

		// Resolve the approving user, depending on whether executed via command or reaction
		const approver = user || msg.author;

		// Create lesson approval embed
		const approvedEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setDescription(`${approver} has approved this lesson plan.`)
			.setFooter(await dateTimeGroup());

		// Send lesson approval embed
		sendMsg(msg.channel, { embeds: [approvedEmbed] });

		// Mark lesson as approved in database
		lessonDocument.approved = true;
		// Save the <Lesson> document and return it
		return await lessonDocument.save().catch(error => console.error(error));
	};

	return approve;
};

/**
 * Process an \<Instructor> object into a formatted string of user mentions
 * @function commands.approve~processMentions
 * @param {Typings.Instructors} instructors An \<Instructors> object
 * @returns {string} A newline-delimited string of formatted user mentions
 */
function processMentions(instructors) {
	// Map the nested objects to a new string[] of formatted mentions, then join the string[] with a newline separator
	return Object.values(instructors)
		.map(user => `<@!${user.id}>`)
		.join('\n');
}