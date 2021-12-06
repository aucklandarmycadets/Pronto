'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');
const mongoose = require('mongoose');

// Import chrono to schedule weekly lesson reminders
let chrono = require('chrono-node');
chrono = new chrono.Chrono(chrono.en.createConfiguration(false, true));

const { Lesson } = require('../models');
const { commandError, deleteMsg, dateTimeGroup, enumerateResources, isURL, processResources, promptEmbed, sendDirect, sendMsg, successReact, titleCase } = require('../modules');
const { confirmWithReaction, unsubmittedLessons } = require('../handlers');

/**
 * Set to ensure that each assigner (identified by their \<User.id>) does not attempt to assign more than one lesson at a time
 * @type {Set<Discord.Snowflake>}
 */
const recentlyAssigned = new Set();

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @module commands/assign
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { lessonsID, trainingIDs }, commands: { seen, assign }, colours, emojis } = await require('../handlers/database')(guild);

	/**
	 * Assign a lesson to specified instructors by creating a private lesson channel and dispatching a lesson warning
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	assign.execute = async ({ msg }) => {
		const { bot } = require('../pronto');

		// Extract mentioned members
		const lessonInstructors = msg.mentions.members;

		try {
			// Ensure there was at least one member mentioned
			if (lessonInstructors.size === 0) throw 'You must tag a user.';

			// Ensure no mentioned members are a bot
			else if (lessonInstructors.some(mention => mention.user.bot)) throw 'You cannot assign a lesson to a bot!';

			// Ensure the assigner does not already exist in the recentlyAssigned set
			else if (recentlyAssigned.has(msg.author.id)) throw 'You are already assigning a lesson!';
		}

		catch (error) { return commandError(msg, error, assign.error); }

		// Delete the command message
		deleteMsg(msg);

		// Add the assigner's ID to the recentlyAssigned set
		// This ensures that each assigner cannot attempt to assign more than one lesson at a time
		recentlyAssigned.add(msg.author.id);

		// Create assign embed
		const assignEmbed = new Discord.MessageEmbed()
			.setTitle('Assigning Lesson...')
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.success)
			.setDescription('Type `restart` to start again, or `cancel` to abort.')
			// Resolve the mentioned members into a formatted string and add new field
			.addField('Instructor(s)', processMentions(lessonInstructors))
			.setFooter(await dateTimeGroup());

		// Send the assign embed
		sendDirect(msg.author, { embeds: [assignEmbed] }, msg.channel);

		// Object defining the required inputs to properly assign a lesson
		// Object keys represent the type of data retained - the object is passed into the getUserInput() function, which returns an object with matching keys storing the user's input
		const neededInputs = {
			lessonName: {
				prompt: 'What is the name of the lesson?',
				type: 'TEXT',
				allowMultiple: false,
			},
			dueTimestamp: {
				prompt: 'When is the lesson plan due?',
				type: 'DATE',
				allowMultiple: false,
			},
			lessonTimestamp: {
				prompt: 'When will the lesson be taught?',
				type: 'DATE',
				allowMultiple: false,
			},
			resources: {
				prompt: 'Provide any resources for the lesson if applicable.\n\nReply `done` when finished.',
				type: 'ATTACHMENT',
				allowMultiple: true,
			},
		};

		// Pass the neededInputs object into the getUserInput() function to collect user's input
		const userInput = await getUserInput(msg, neededInputs, colours);

		// If getUserInput() returns the symbol 'CANCEL', cancel the assigning of the lesson
		if (userInput === 'CANCEL') {
			// Create cancellation embed
			const cancelEmbed = new Discord.MessageEmbed()
				.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
				.setColor(colours.error)
				.setDescription('**Cancelled.**')
				.setFooter(await dateTimeGroup());

			// Remove the assigner's ID from the recentlyAssigned set
			recentlyAssigned.delete(msg.author.id);

			// Send the cancellation embed and cease further execution
			return sendDirect(msg.author, { embeds: [cancelEmbed] }, null, true);
		}

		// Destructure desired user's input from the returned value of the getUserInput() function
		const { lessonName, dueTimestamp, lessonTimestamp, resources } = userInput;

		// Obtain and store formatted date-time groups from parsed time stamps
		const dueDate = await dateTimeGroup(dueTimestamp);
		const lessonDate = await dateTimeGroup(lessonTimestamp);

		// Create lesson assignment confirmation embed
		const lessonEmbed = new Discord.MessageEmbed()
			.setTitle(`Lesson Assignment - ${lessonName}`)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.warn)
			// Call processMentions() to format the lesson instructors
			.addField('Instructor(s)', processMentions(lessonInstructors))
			.addField('Lesson', lessonName)
			.addField('Lesson Plan Due', dueDate)
			.addField('Lesson Date', lessonDate)
			// Call modules.enumerateResources() to format and output the lesson resources
			.addField('Resources', enumerateResources(resources, true))
			.setFooter('Use the reactions below to confirm or cancel.');

		// Send the lesson assignment confirmation embed to the assigner
		sendDirect(msg.author, { embeds: [lessonEmbed] }, null, true)
			.then(dm => {
				/**
				 * Create a private lesson channel for specified instructors and dispatch the lesson warning, as well as a message to request acknowledgement from the instructor(s)
				 */
				const assignLesson = async () => {
					// Set channel topic to be a list of the instructor(s)'s mentions, and create the channel under the lessons category channel
					const channelOptions = { topic: processMentions(lessonInstructors), parent: lessonsID };

					// Create the private lesson channel, with a name matching the lesson name and with the above channel options
					// '.' in lesson name are invalid characters for channel names, therefore substitute them with '-'
					await guild.channels.create(lessonName.replace('.', '-'), channelOptions)
						.then(async channel => {
							// Once the channel has been created, ensure the correct visibility permissions are applied
							// Make the channel private for all users other than the bot, training cell, and instructors
							await channel.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
							channel.createOverwrite(guild.roles.everyone, { 'VIEW_CHANNEL': false });
							trainingIDs.forEach(staff => channel.createOverwrite(staff, { 'VIEW_CHANNEL': true }));
							lessonInstructors.each(instructor => channel.createOverwrite(instructor, { 'VIEW_CHANNEL': true }));

							// Create and save a new database entry for the lesson
							saveLesson(channel.id);

							// Remove the assigner's ID from the recentlyAssigned set now that lesson assignment has been completed
							recentlyAssigned.delete(msg.author.id);

							// Modify the lesson assignment confirmation embed to repurpose it into the lesson warning embed
							lessonEmbed.setTitle(`Lesson Warning - ${lessonName}`);
							lessonEmbed.setDescription('You have been assigned a lesson, use this channel to organise yourself.');
							lessonEmbed.setFooter(await dateTimeGroup());

							// If there is only one instructor, set the author of the lesson warning embed to be the instructor's name and display avatar
							if (lessonInstructors.size === 1) lessonEmbed.setAuthor(lessonInstructors.first().displayName, lessonInstructors.first().user.displayAvatarURL({ dynamic: true }));
							// Otherwise, if there are multiple instructors, set the author to be the guild's name and guild icon
							else lessonEmbed.setAuthor(guild.name, guild.iconURL({ dynamic: true }));

							// Send the lesson warning embed to the private lesson channel
							await sendMsg(channel, { embeds: [lessonEmbed] });
							// Call unsubmittedLessons() to update the master unsubmitted lessons tracker embed
							unsubmittedLessons(guild);

							// Retrieve the guild's success emoji
							const successEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

							// Create a new embed to prompt the instructor(s)'s acknowledgement of the lesson warning
							const ackEmbed = new Discord.MessageEmbed()
								.setDescription(`Click the ${successEmoji} to acknowledge receipt of this lesson warning.\n\nAlternatively, you can manually type \`!seen\`.`)
								.setColor(colours.primary);

							// Send the acknowledgement embed, and tag each instructor in the message body
							sendMsg(channel, { content: processMentions(lessonInstructors), embeds: [ackEmbed] })
								.then(async ackMessage => {
									// Add the success reaction to the acknowledgement message
									await successReact(ackMessage);

									// Filter reaction collector for reactions only of the success emoji, and that are made by an instructor
									const filter = (reaction, user) => reaction.emoji.name === emojis.success.name && lessonInstructors.has(user.id);
									// Create a new reaction collector on the acknowledgement message with the filter applied
									const collector = ackMessage.createReactionCollector(filter, { dispose: true });

									// Execute the commands\seen.js <Command> when an instructor acknowledges the lesson warning via reaction
									collector.on('collect', async (_, user) => bot.commands.get(seen.command).execute({ msg: ackMessage, user: user }));
								});
						})
						.catch(error => console.error(`Error creating ${lessonName} in ${guild.name}\n`, error));
				};

				/**
				 * Remove the assigner's ID from the recentlyAssigned set
				 */
				const assignCancelled = () => recentlyAssigned.delete(msg.author.id);

				// Call handlers.confirmWithReaction() on the lesson assignment confirmation embed with assignLesson() and assignCancelled() as callbacks
				return confirmWithReaction(msg, dm, assignLesson, assignCancelled);
			});

		/**
		 * Create a new mongoose \<Lesson> document for the assigned lesson
		 * @param {Discord.Snowflake} channelID The \<TextChannel.id> of the private lesson channel created for the lesson
		 * @returns {Promise<Typings.Lesson>} The mongoose document for the lesson
		 */
		async function saveLesson(channelID) {
			// For each instructor, create a new nested object within the instructors object with an ID property and a boolean flag to record acknowledgement status
			const instructors = Object.fromEntries(
				lessonInstructors.map(mention => [mention.id, {
					id: mention.id,
					seen: false,
				}]),
			);

			/**
			 * Create a new \<Lesson> document
			 * @type {Typings.Lesson}
			 */
			const lesson = await new Lesson({
				_id: mongoose.Types.ObjectId(),
				lessonID: channelID,
				lessonName: lessonName,
				instructors: instructors,
				dueDate: dueDate,
				dueTimestamp: dueTimestamp,
				lessonDate: lessonDate,
				lessonTimestamp: lessonTimestamp,
				assignedResources: enumerateResources(resources),
			});

			// Save the <Lesson> document and return it
			return await lesson.save().catch(error => console.error(error));
		}
	};

	return assign;
};

/**
 * @typedef {'TEXT' | 'DATE' | 'ATTCHMENT'} InputType A \<string> representation of the type of input
 * - Text inputs only require an input, with no additional error checking
 * - Date inputs are parsed through chrono to ensure a valid date is recognised and return a Unix timest
 * - Attachments allow attachments to be uploaded or URLs to be entered, with appropriate error checking
 */

/**
 * Collect the all the required inputs from the user and return an object with their completed inputs
 * @param {Discord.Message} msg The \<Message> that executed the \<Command>
 * @param {Object.<string, {prompt: string, type: InputType, allowMultiple: boolean}>} prompts An object defining the individual inputs to prompt for
 * - Must contain an object.prompt property of type \<string>
 * - Must contain an object.type property for the type of input of type \<string>: `TEXT` || `DATE` || `ATTACHMENT`
 * - Must contain an object.allowMultiple \<boolean>: `true` || `false`
 * - Text inputs only require an input, with no additional error checking
 * - Date inputs are parsed through chrono to ensure a valid date is recognised and return a Unix timestamp (ms)
 * - Attachments allow attachments to be uploaded or URLs to be entered, with appropriate error checking
 * @param {Typings.Colours} colours The guild's colour object
 * @returns {Promise<Object.<string, string | number> | 'CANCEL'>} An object with the user's completed inputs stored in each respective property, or the symbol `CANCEL` to represent a cancelled lesson assignment
 */
async function getUserInput(msg, prompts, colours) {
	// Initialise an empty object in preparation to store the user's input to each property of prompts as they are completed individually in turn
	const input = {};

	// Loop through each needed input prompt
	for (const [key, value] of Object.entries(prompts)) {
		// If the current prompt allows for multiple inputs, call the whileLoop() function
		if (value.allowMultiple) input[key] = await whileLoop(promptEmbed(value.prompt, colours.primary), msg, value.type, colours, value.allowMultiple);
		// Otherwise, call the msgPrompt() function
		else input[key] = await msgPrompt(promptEmbed(value.prompt, colours.primary), msg, value.type, colours, value.allowMultiple);

		try {
			// If the received symbol is to 'RESTART', restart input by returning getUserInput() recursively
			if (input[key] === 'RESTART') return await getUserInput(msg, prompts, colours);
			// Otherwise, if the received symbol is to 'CANCEL', return the same symbol from getUserInput()
			else if (input[key] === 'CANCEL') return 'CANCEL';
		}
		catch { null; }
	}

	// If all inputs have been successfully completed, return the completed input object
	return input;
}

/**
 * Display a prompt to the user and collect & process their input according to the type of input
 * @param {Discord.MessageEmbed} prompt The embed to use to prompt the user for the input
 * @param {Discord.Message} msg The \<Message> that executed the \<Command>
 * @param {InputType} type The type of input being prompted for: `TEXT` || `DATE` || `ATTACHMENT`
 * @param {Typings.Colours} colours The guild's colour object
 * @param {boolean} allowMultiple Whether to allow multiple inputs
 * @returns {Promise<string | number | 'RESTART' | 'CANCEL' | 'DONE'>} The user's input, or the symbols `RESTART` || `CANCEL` || `DONE`
 * - Text inputs return a \<string>
 * - Date inputs return a Unix timestamp (ms) as \<number>
 * - Attachments return a URL formatted as a hyperlink using processResources() as \<string>
 * - `RESTART` = restart input from the beginning
 * - `CANCEL` = cancel lesson assignment
 * - `DONE` = attachment input is complete
 */
async function msgPrompt(prompt, msg, type, colours, allowMultiple) {
	// Filter message collector for messages only sent by command author
	const filter = message => message.author.id === msg.author.id;

	// Send the prompt embed to the user, and await the user's input
	// Use Promise.all() to wait for the user's input before proceeding
	const input = await Promise.all([
		sendDirect(msg.author, { embeds: [prompt] }, null, true),
		msg.author.dmChannel.awaitMessages(filter, { max: 1 }),
	])
		// Extract the user's input from the resolved Promises
		.then(resolved => resolved[1].first());


	// Use a try {} catch {} block to utilise throw
	try {
		// If the user desires to restart or cancel input, return the appropriate symbol
		if (input.content.toLowerCase() === 'restart') throw 'RESTART';
		else if (input.content.toLowerCase() === 'cancel') throw 'CANCEL';
		// Otherwise, if the user has completed their multiple inputs, and the current prompt allows multiple inputs (such that 'done' is a keyword), return the 'DONE' symbol
		else if (input.content.toLowerCase() === 'done' && allowMultiple) throw 'DONE';

		if (type === 'TEXT' || type === 'DATE') {
			// If the type of input to be validated is 'TEXT' or 'DATE', ensure the input is not empty
			// Uploaded attachments have a null <Message.content>, so cannot be checked here
			if (!input.content) {
				// If the input is empty, send an error and try again
				sendDirect(msg.author, { embeds: [promptEmbed('You must enter something!', colours.error)] }, null, true);
				throw await msgPrompt(prompt, msg, type, colours, allowMultiple);
			}

			// If the input is of type 'DATE', try to parse the date and obtain a Unix timestamp
			if (type === 'DATE') {
				const parsedDate = chrono.parseDate(input.content);

				// If no date has been successfully parsed, send an error and try again
				if (!parsedDate) {
					sendDirect(msg.author, { embeds: [promptEmbed('I don\'t recognise that date, please try again.', colours.error)] }, null, true);
					throw await msgPrompt(prompt, msg, type, colours, allowMultiple);
				}

				// If a date has been successfully parsed, return its Unix (ms) timestamp
				throw parsedDate.setHours(18, 0, 0, 0).valueOf();
			}

			// If the input is of type 'TEXT' and is not empty, return it through modules.titleCase()
			throw titleCase(input.content);
		}

		else if (type === 'ATTACHMENT') {
			// Otherwise, if the input is of type 'ATTACHMENT', parse the input for URLs and check for uploaded attachments
			const substrings = input.content.split(/ +/);
			const attachments = input.attachments.first();
			// Filter the substrings of the input message for URLs
			const URLs = substrings.filter(substr => isURL(substr));

			// If there have not been any attachments uploaded and no URLs have been successfully parsed, send an error and try again
			if (!attachments && !URLs.length) {
				sendDirect(msg.author, { embeds: [promptEmbed('You must attach a file or enter a URL!', colours.error)] }, null, true);
				throw await msgPrompt(prompt, msg, type, colours, allowMultiple);
			}

			// Otherwise, if there have successfully been attachments and/or URLs input, return it through modules.processResources()
			throw processResources(attachments, URLs);
		}
	}

	catch (thrown) { return thrown; }
}

/**
 * Implements a loop to allow multiple inputs for a given prompt, which are returned in an array
 * @param {Discord.MessageEmbed} prompt The embed to use to prompt the user for the input
 * @param {Discord.Message} msg The \<Message> that executed the \<Command>
 * @param {InputType} type The type of input being prompted for: `TEXT` || `DATE` || `ATTACHMENT`
 * @param {Typings.Colours} colours The guild's colour object
 * @param {boolean} allowMultiple Whether to allow multiple inputs
 * @returns {Promise<string[] | number[] | 'RESTART' | 'CANCEL'>} An array of the user's inputs, or the symbols `RESTART` || `CANCEL`
 * - The type stored within the array is dependent on the input type returned by msgPrompt()
 * - `RESTART` = restart input from the beginning
 * - `CANCEL` = cancel lesson assignment
 */
async function whileLoop(prompt, msg, type, colours, allowMultiple) {
	// Initialise an empty array to store the user's multiple inputs
	const array = [];

	/**
	 * A recursive function which repeatedly prompts the user for input until loop is ended
	 * @returns {Promise<string[] | number[] | 'RESTART' | 'CANCEL'>} An array of the user's inputs, or the symbols `RESTART` || `CANCEL`
	 * - The type stored within the array is dependent on the input type returned by msgPrompt()
	 * - `RESTART` = restart input from the beginning
	 * - `CANCEL` = cancel lesson assignment
	 */
	async function loop() {
		// Call the msgPrompt() function and collect & process the user's input
		const input = await msgPrompt(prompt, msg, type, colours, allowMultiple);

		// If the user desires to restart or cancel input, return the appropriate symbol
		if (input === 'RESTART') return 'RESTART';
		else if (input === 'CANCEL') return 'CANCEL';

		// Otherwise, if the user has completed input, return the array
		else if (input === 'DONE') return array;

		// Otherwise, if the user has yet to complete input, push the new input to the array and loop again
		else {
			array.push(input);
			return await loop(prompt, msg, type);
		}
	}

	return await loop();
}

/**
 * Process a Collection\<GuildMember.Snowflake, GuildMember> into a formatted string of user mentions
 * @param {Discord.Collection<Discord.Snowflake, Discord.GuildMember>} members A Collection\<GuildMember.Snowflake, GuildMember> to process
 * @returns {string} A newline-delimited string of formatted user mentions
 */
function processMentions(members) {
	// Map the <GuildMember> instances to a new string[] of mentions, then join the string[] with a newline separator
	return members.map(member => member.toString())
		.join('\n');
}