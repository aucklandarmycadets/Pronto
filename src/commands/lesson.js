'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { Lesson } = require('../models');
const { dateTimeGroup, enumerateResources, formatRoles, isURL, processResources, remove } = require('../modules');
const { commandError, confirmWithReaction, createEmbed, deleteMsg, errorReact, findGuildConfiguration, sendDirect, sendMsg, successReact, unsubmittedLessons } = require('../handlers');

/**
 * Set to ensure that lessons (identified by their \<TextChannel.id>) which are pending confirmation of submission cannot be submitted again
 * @type {Set<Discord.Snowflake>}
 * @memberof commands.lesson
 */
const pendingConfirmation = new Set();

/**
 * @member {commands.Command} commands.lesson A family of sub-commands for an instructor to manage an existing lesson
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { lessonsId, trainingIds }, commands: { lesson, seen, approve }, colours, emojis } = await findGuildConfiguration(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	lesson.execute = async ({ msg, args, msgCommand }) => {
		const { bot } = require('../pronto');

		/**
		 * @type {?Typings.Lesson}
		 */
		// Find <Lesson> document by querying database for lesson channel Id
		let lessonDocument = await Lesson.findOne({ lessonId: msg.channel.id }).exec()
			.catch(error => console.error(error));

		// Attempt to parse the lesson sub-command from the command message
		const command = (lesson.aliases.includes(msgCommand))
			// If the message command is one of the <BaseCommand.aliases> (i.e. a valid lesson sub-command), use it
			? msgCommand
			// Otherwise, the <Command> must have been executed with <CommandName>
			: (args.length)
				// Take the first command argument if it exists
				? args.shift().toLowerCase()
				// If the arguments are empty, then there must not be a sub-command
				: null;

		// Extract the <MessageAttachment> if it exists
		const attachments = msg.attachments.first();
		// Filter the command arguments for URLs
		const urls = args.filter(arg => isURL(arg));

		try {
			// Ensure message channel is contained within lessons category
			if (msg.channel.parentId !== lessonsId) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsId);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			// Ensure <Lesson> has been found
			else if (!lessonDocument) throw 'Invalid lesson channel.';

			// Ensure the command author is an instructor of the lesson
			else if (!lessonDocument.instructors[msg.author.id]) throw 'You are not an instructor for this lesson!';

			// If the command author has not yet acknowledged receipt of the lesson warning, execute commands\seen.js
			else if (!lessonDocument.instructors[msg.author.id].seen) lessonDocument = await bot.commands.get(seen.command).execute({ msg, user: msg.author });

			// If the lesson sub-command is 'add', ensure there was at least one attachment or URL
			if (command === 'add') {
				if (!attachments && !urls.length) throw 'You must attach a file or enter a URL!';
			}

			// If the lesson sub-command is 'remove', ensure there are existing submitted resources
			else if (command === 'remove') {
				if (!lessonDocument.submittedResources.length) throw 'There are no resources to remove.';
			}

			// If the lesson sub-command is 'submit':
			else if (command === 'submit') {
				// Ensure there are changes to submit
				if (!lessonDocument.changed && !lessonDocument.submitted) throw 'There is nothing to submit!';

				// Ensure there have been changes since the previous submission
				else if (!lessonDocument.changed && lessonDocument.submitted) throw 'There are no changes to submit.';

				// Ensure the lesson has not already been submitted and is pending confirmation of submission
				else if (pendingConfirmation.has(lessonDocument.lessonId)) throw 'This lesson has already been submitted and is pending confirmation in your Direct Messages.';
			}

			// Ensure the lesson sub-command has been successfully parsed
			else if (!lesson.aliases.includes(command)) throw 'Invalid input.';
		}

		catch (thrownError) { return commandError(msg, thrownError, lesson.error); }

		/**
		 * Preview details and attached resources of an assigned lesson
		 */
		if (command === 'view') {
			// Success react to command message
			successReact(msg);

			// Create lesson preview embed
			const lessonEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.primary)
				.setTitle(`Lesson Preview - ${lessonDocument.lessonName}`)
				// Call <Lesson.processMentions()> to format the lesson instructors
				.addField('Instructor(s)', lessonDocument.processMentions())
				.addField('Lesson', lessonDocument.lessonName)
				.addField('Lesson Plan Due', lessonDocument.dueDate)
				.addField('Lesson Date', lessonDocument.lessonDate)
				// Call modules.enumerateResources() to format and output the lesson resources
				.addField('Resources', enumerateResources(lessonDocument.submittedResources, true))
				.setFooter(await dateTimeGroup(guild));

			// Send the lesson preview embed
			return sendMsg(msg.channel, { embeds: [lessonEmbed] });
		}

		/**
		 * Add resource(s) to a lesson
		 */
		else if (command === 'add') {
			// Success react to command message
			successReact(msg);

			// If the added resources already exist in the lesson's submittedResources string[], cease further execution
			if (lessonDocument.submittedResources.includes(processResources(attachments, urls))) return;

			// Add the resource to the lesson's submittedResources string[]
			lessonDocument.submittedResources.push(processResources(attachments, urls));
			// Mark the lesson as having been changed, and ensure it is not marked as approved
			lessonDocument.changed = true;
			lessonDocument.approved = false;

			// Save the <Lesson> document
			lessonDocument.save().catch(error => console.error(error));

			// Create lesson updated embed
			const updatedEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.success)
				.setTitle('Lesson Resources Updated')
				.setDescription(`**${msg.member.displayName}** has added a new resource to this lesson.`)
				.addField('Lesson', lessonDocument.lessonName)
				// Call modules.enumerateResources() to format and output the lesson resources
				.addField('Resources', enumerateResources(lessonDocument.submittedResources, true))
				.setFooter(await dateTimeGroup(guild));

			// Send the lesson updated embed
			return sendMsg(msg.channel, { embeds: [updatedEmbed] });
		}

		/**
		 * Remove a resource from a lesson
		 */
		else if (command === 'remove') {
			// Call serialiseResources() and destructure the serialised resources string[] and valid range number[]
			const { resources, range } = serialiseResources(lessonDocument);

			// Create serialised resources embed
			const resourcesEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.error)
				.setTitle('Remove a Lesson Resource')
				.addField('Lesson', lessonDocument.lessonName)
				// Join the array of serialised resources with a newline separator
				.addField('Resources', resources.join('\n'))
				.setFooter('Enter the corresponding serial for the resource you wish to remove, or \'cancel\' to abort.');

			// Send the serialised resources embed
			sendMsg(msg.channel, { embeds: [resourcesEmbed] });

			// Call getNumberInput() to collect user's input for the resource to remove
			const removeIndex = await getNumberInput(msg, range, colours);

			// If getNumberInput() returns the symbol 'CANCEL', cancel the removal of a resource
			if (removeIndex === 'CANCEL') {
				// Error react to command message
				errorReact(msg);

				// Create cancellation embed
				const cancelEmbed = new Discord.MessageEmbed()
					.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
					.setColor(colours.error)
					.setDescription('**Cancelled.**')
					.setFooter(await dateTimeGroup(guild));

				// Send the cancellation embed and cease further execution
				return sendMsg(msg.channel, { embeds: [cancelEmbed] });
			}

			// Success react to command message
			successReact(msg);

			// Remove the resource at the index returned by getNumberInput() (accounting for a zero-indexed array)
			lessonDocument.submittedResources = remove(lessonDocument.submittedResources, null, removeIndex - 1);
			// Mark the lesson as having been changed, and ensure it is not marked as approved
			lessonDocument.changed = true;
			lessonDocument.approved = false;

			// Save the <Lesson> document
			lessonDocument.save().catch(error => console.error(error));

			// Create lesson updated embed
			const updatedEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.success)
				.setTitle('Lesson Resources Updated')
				.setDescription(`**${msg.member.displayName}** has removed a resource from this lesson.`)
				.addField('Lesson', lessonDocument.lessonName)
				// Call modules.enumerateResources() to format and output the lesson resources
				.addField('Resources', enumerateResources(lessonDocument.submittedResources, true))
				.setFooter(await dateTimeGroup(guild));

			// Send the lesson updated embed
			return sendMsg(msg.channel, { embeds: [updatedEmbed] });
		}

		/**
		 * Submit a lesson for approval
		 */
		else if (command === 'submit') {
			// Delete the command message
			deleteMsg(msg);

			// Add the lesson Id to the pendingConfirmation set
			pendingConfirmation.add(lessonDocument.lessonId);

			// Create lesson submission confirmation embed
			const submitEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.warn)
				.setTitle(`Lesson Submission - ${lessonDocument.lessonName}`)
				// Call <Lesson.processMentions()> to format the lesson instructors
				.addField('Instructor(s)', lessonDocument.processMentions())
				.addField('Lesson', lessonDocument.lessonName)
				.addField('Lesson Plan Due', lessonDocument.dueDate)
				.addField('Lesson Date', lessonDocument.lessonDate)
				// Call modules.enumerateResources() to format and output the lesson resources
				.addField('Resources', enumerateResources(lessonDocument.submittedResources, true))
				.setFooter('Use the reactions below to confirm or cancel.');

			// Send the lesson submission confirmation embed to the submitting instructor
			sendDirect(msg.author, { embeds: [submitEmbed] }, msg.channel)
				.then(dm => {
					/**
					 * Create a lesson submission embed in a lesson channel and prompt for lesson plan approval by the Training Cell
					 * @function commands.lesson~lessonSubmit
					 */
					const lessonSubmit = async () => {
						// 'Save' the changes and mark the lesson as being unchanged, and ensure it is marked as submitted
						lessonDocument.changed = false;
						lessonDocument.submitted = true;

						// Save the <Lesson> document
						lessonDocument.save().catch(error => console.error(error));

						// Remove the lesson Id from the pendingConfirmation set
						pendingConfirmation.delete(lessonDocument.lessonId);

						// Modify the lesson submission confirmation embed to repurpose it into the lesson submission embed
						submitEmbed.setTitle(`Lesson Plan Submitted - ${lessonDocument.lessonName}`);
						submitEmbed.setColor(colours.success);
						submitEmbed.setFooter(await dateTimeGroup(guild));

						// Send the lesson submission embed to the private lesson channel
						await sendMsg(msg.channel, { embeds: [submitEmbed] });

						// Regex expression to match URL resources
						const urlTest = /\[Resource \d+\]/;
						// Regex expression to parse a <MessageAttachment> resource
						// The first capture group matches the file name, and the second capture group matches the attachment URL
						const attachmentParser = /\[(.+)\]\((.+)\)/;

						// Filter the enumerated submittedResources string[] for any <MessageAttachment> resources, then send the parsed attachments to the lesson channel as a <MessageAttachment>
						// Use Promise.all() to ensure all <MessageAttachment> messages have been sent before proceeding
						await Promise.all(enumerateResources(lessonDocument.submittedResources)
							.filter(resource => !urlTest.test(resource))
							.map(resource => sendMsg(msg.channel, { attachments: new Discord.MessageAttachment(resource.match(attachmentParser)[2], resource.match(attachmentParser)[1].replace(/\\/g, '')) })),
						);

						// Retrieve the guild's success emoji
						const successEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

						// Create a new embed to prompt the Training Cell's approval of the submitted lesson plan
						const approveEmbed = new Discord.MessageEmbed()
							.setDescription(`Click the ${successEmoji} to approve this lesson plan.\n\nAlternatively, you can manually type \`!approve\`.`)
							.setColor(colours.primary);

						// Send the approval embed, and tag the Training Cell's roles in the message body
						sendMsg(msg.channel, { content: formatRoles(trainingIds, true), embeds: [approveEmbed] })
							.then(async approveMsg => {
								// Add the success reaction to the approval message
								await successReact(approveMsg);

								// Filter reaction collector for reactions only of the success emoji, and that are made by a user with a Training Cell role
								const filter = async (reaction, user) => {
									const roles = await msg.guild.members.fetch(user.id).then(member => member.roles.cache);
									return reaction.emoji.name === emojis.success.name && roles.some(role => trainingIds.includes(role.id));
								};

								// Create a new reaction collector on the approval message with the filter applied
								const collector = approveMsg.createReactionCollector(filter, { dispose: true });

								// Execute the commands\approve.js <Command> when a user with a Training Cell role approves the lesson plan via reaction
								collector.on('collect', async (_, user) => bot.commands.get(approve.command).execute({ msg, user }));
							});

						// Call handlers.unsubmittedLessons() to update the embed of unsubmitted lessons
						unsubmittedLessons(guild);
					};

					/**
					 * Remove the lesson Id from the pendingConfirmation set
					 * @function commands.lesson~lessonCancelled
					 */
					const lessonCancelled = () => pendingConfirmation.delete(lessonDocument.lessonId);

					// Call handlers.confirmWithReaction() on the lesson assignment confirmation embed with assignLesson() and assignCancelled() as callbacks
					return confirmWithReaction(msg, dm, lessonSubmit, lessonCancelled);
				});
		}
	};

	return lesson;
};

/**
 * Serialises a \<Lesson.submittedResources> \<string[]> for display and creates a \<number[]> of the serials
 * @function commands.lesson~serialiseResources
 * @param {Typings.Lesson} document The mongoose document for the lesson
 * @returns {{resources: string[], range: number[]}} A \<string[]> of the serialised resources, and a \<number[]> of the valid serials
 */
function serialiseResources(document) {
	// Split apart any potential string[] elements which contain both a <MessageAttachment> and a URL, and return a flattened string[]
	const processedArray = document.submittedResources.flatMap(resource => resource.split('\n'));

	// Filter processedArray for any <MessageAttachment> resources, and store in a new string[]
	const attachmentArray = processedArray.filter(resource => !resource.startsWith('[Resource]'));

	// Filter processedArray for URL resources, and store in a new string[]
	const databaseArray = processedArray.filter(resource => resource.startsWith('[Resource]'));
	// Map the databaseArray of URL resources to a new string[] of enumerated [Resource n] strings
	const urlArray = databaseArray.map((resource, i) => `[Resource ${i + 1}]${resource.replace('[Resource]', '')}`);

	// Save the new databaseArray in the <Lesson> document, to ensure that the user's input corresponds to their intended array element
	document.submittedResources = [...attachmentArray, ...databaseArray];
	document.save().catch(error => console.error(error));

	// Concatenate the URL string[] to the <MessageAttachment> resource string[], then map it to a new string[] of serialised resource strings
	const resources = [...attachmentArray, ...urlArray]
		.map((resource, i) => `\`${i + 1}\` ${resource}`);

	// Return the serialised resource string[], and return a new number[] of the serials
	return { resources, range: resources.map((_, i) => i + 1) };
}

/**
 * Collect and return a \<number> input from the user
 * @function commands.lesson~getNumberInput
 * @param {Discord.Message} msg The \<Message> that executed the \<Command>
 * @param {number[]} range A \<number[]> of valid number inputs
 * @param {Typings.Colours} colours The guild's colour object
 * @returns {Promise<number | 'CANCEL'>} The user's input, or the symbol `CANCEL`
 */
async function getNumberInput(msg, range, colours) {
	// Await user's reply and extract the message from the resolved <Collection>
	const reply = await msg.channel.awaitMessages(_msg => _msg.author.id === msg.author.id, { max: 1 })
		.then(collected => collected.first());

	try {
		// If the user desires to cancel input, return the 'CANCEL' symbol
		if (reply.content.toLowerCase() === 'cancel') throw 'CANCEL';

		// If the input cannot be cast to a number, send an error message and try again
		else if (isNaN(Number(reply.content))) {
			sendMsg(msg.channel, { embeds: [createEmbed('You must enter a number.', colours.error)] });
			throw await getNumberInput(msg, range, colours);
		}

		// If the input is a number but is not in the range number[] (i.e. invalid), send an error message and try again
		else if (!range.includes(Number(reply.content))) {
			sendMsg(msg.channel, { embeds: [createEmbed(`You must enter a number between ${range[0]} and ${range[range.length - 1]}.`, colours.error)] });
			throw await getNumberInput(msg, range, colours);
		}

		// If the input is a valid number, return the input as a number
		throw Number(reply.content);
	}

	catch (thrown) { return thrown; }
}