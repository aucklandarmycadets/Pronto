'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');
const mongoose = require('mongoose');

const { Attendance } = require('../models');
const { dateTimeGroup } = require('../modules');
const { commandError, confirmWithReaction, deleteMsg, emojiReact, findGuildConfiguration, sendDirect, sendMsg } = require('../handlers');

/**
 * @member {commands.Command} commands.attendance Process an attendance register by creating an attendance embed and sending it to the attendance and original message command channels
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { attendanceID, formations }, commands: { attendance }, colours } = await findGuildConfiguration(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	attendance.execute = async ({ msg, args }) => {
		const { bot } = require('../pronto');

		// Ensure the command arguments are not empty, i.e. a register is actually present
		try {
			if (args.length === 0) throw '';

			if (args[0].toLowerCase() === 'update' && args.length === 1) throw '';
		}

		catch (error) {
			return commandError(msg, 'You cannot submit an empty register.', attendance.error);
		}

		// Delete the command message
		deleteMsg(msg);

		// Initialise formation colour & name to their default values, i.e. the guild's default colour, and the guild's name
		let formationColour = colours.default;
		let formationName = msg.guild.name;

		// Check whether the command author has any formation roles, defined in the guild's config
		for (const role of Object.values(msg.member.roles.cache.array())) {
			// If so, update the formation colour & name to be that role's colour & name
			if (formations.includes(role.id)) {
				formationColour = role.color;
				formationName = role.name;
			}
		}

		// Check for legacy syntax - if the command intention is to update an existing register, return an error message instructing the user to use the edit reaction
		if (args[0].toLowerCase() === 'update') return commandError(msg, 'Please use the 📝 reaction to edit a register.', attendance.error);

		// Otherwise, execute createRegister()
		else createRegister();

		/**
		 * Create an attendance register and prompt confirmation from the user
		 * @function commands.attendance~createRegister
		 */
		function createRegister() {
			// Parse the attendance register from the message arguments, by joining them into a string separated by a space, then splitting again by newlines
			const content = args.join(' ').split('\n');
			// Extract the title of the register as the first line of the message (before the first newline), removing it from the content string[]
			const title = content.shift();
			// Join the remaining lines of the content string[] together separated by newlines, to form the body of the register
			const register = content.join('\n');

			// Create attendance register confirmation embed
			const attendanceEmbed = new Discord.MessageEmbed()
				// Set the appropriate values for formation colour & name
				.setColor(formationColour)
				.setAuthor(formationName, msg.guild.iconURL({ dynamic: true }))
				.setTitle(title)
				.setDescription(register)
				.setFooter('Use the reactions below to confirm or cancel.');

			// Send attendance register confirmation embed to the user
			sendDirect(msg.author, { embeds: [attendanceEmbed] }, msg.channel)
				.then(dm => {
					/**
					 * Send the completed attendance embed to both the original submission channel and the guild's attendance channel upon confirmation
					 * @function commands.attendance~sendAttendance
					 */
					const sendAttendance = async () => {
						// Update the embed author to include the submitting user
						attendanceEmbed.setAuthor(`${formationName} (${msg.member.displayName})`, msg.guild.iconURL({ dynamic: true }));
						// Update the footer to be a timestamp
						attendanceEmbed.setFooter(await dateTimeGroup());

						// Get the guild's attendance channel
						const attendanceChannel = bot.channels.cache.get(attendanceID);

						// Send the embed into the guild's attendance channel and the original submission channel
						const attendanceMessage = await sendMsg(attendanceChannel, { embeds: [attendanceEmbed] });
						const channelMessage = await sendMsg(msg.channel, { embeds: [attendanceEmbed] });

						/**
						 * Create and save a new mongoose document to record the register
						 * @type {Typings.Attendance}
						 */
						const document = await new Attendance({
							_id: mongoose.Types.ObjectId(),
							channelID: channelMessage.id,
							attendanceID: attendanceMessage.id,
							name: title,
							formation: formationName,
							author: [msg.author.id],
						});

						document.save();

						// Apply edit and delete reactions to the message in the submission channel
						await emojiReact(channelMessage, '📝');
						await emojiReact(channelMessage, '🗑️');

					};

					// Call handlers.confirmWithReaction() on the register confirmation embed with sendAttendance() as the confirm callback
					confirmWithReaction(msg, dm, sendAttendance);
				});
		}
	};

	return attendance;
};