'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { Lesson } = require('../models');
const { dateTimeGroup, enumerateResources } = require('../modules');
const { commandError, debugError, findGuildConfiguration, sendMsg, successReact } = require('../handlers');

/**
 * @member {commands.Command} commands.approve Approve a submitted lesson plan in a lesson channel, either from a message command or a message reaction
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { lessonsId, lessonPlansId }, commands: { approve }, colours } = await findGuildConfiguration(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 * @returns {Promise<Typings.Lesson>} The mongoose document for the lesson
	 */
	approve.execute = async ({ msg, user }) => {
		/**
		 * @type {?Typings.Lesson}
		 */
		// Find <Lesson> document by querying database for lesson channel Id
		const lessonDocument = await Lesson.findOne({ lessonId: msg.channel.id }).exec()
			.catch(error => console.error(error));

		try {
			// Ensure message channel is contained within lessons category
			if (msg.channel.parentId !== lessonsId) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsId);
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

		catch (thrownError) {
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

			return commandError(msg, thrownError, approve.error);
		}

		// Success react if executed via command
		if (!user) successReact(msg);

		// Get the master lesson plans channel
		const lessonPlansChannel = msg.guild.channels.cache.get(lessonPlansId);

		// Create lesson submission embed
		const submissionEmbed = new Discord.MessageEmbed()
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.success)
			.setTitle(`Lesson Plan - ${lessonDocument.lessonName}`)
			.addField('Instructor(s)', lessonDocument.processMentions())
			.addField('Lesson', lessonDocument.lessonName)
			.addField('Lesson Plan Due', lessonDocument.dueDate)
			.addField('Lesson Date', lessonDocument.lessonDate)
			.addField('Resources', enumerateResources(lessonDocument.submittedResources, true))
			.setFooter(await dateTimeGroup());

		// If lesson has not yet been archived in the master channel, send a copy into the channel
		if (!lessonDocument.archiveId) {
			sendMsg(lessonPlansChannel, { embeds: [submissionEmbed] })
				.then(async archiveMsg => {
					// Record the archived message's Id
					lessonDocument.archiveId = archiveMsg.id;
					await lessonDocument.save().catch(error => console.error(error));
				});
		}

		// If the lesson has previously been archived and has been updated, update the original message
		else {
			let archiveMsg, before;

			// Filter messages in the archive channel for the archived message's Id
			while (!archiveMsg) {
				// Fetch messages in blocks of 100 (maximum allowed by the API) moving back in time until archive message is found
				await lessonPlansChannel.messages.fetch({ limit: 100, before })
					.then(msgs => {
						// Attempt to find the message matching the archived message's Id
						archiveMsg = msgs.get(lessonDocument.archiveId);

						// Update oldest message Id
						before = msgs.last().id;
					})
					.catch(error => debugError(guild, error, `Error fetching messages in ${lessonPlansChannel}.`));
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