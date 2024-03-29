'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup, sentenceCase } = require('../modules');
const { commandError, findGuildConfiguration, sendDirect, sendMsg, successReact } = require('../handlers');

/**
 * @member {commands.Command} commands.leave
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { attendanceId }, commands: { leave, leaveFor }, colours } = await findGuildConfiguration(guild);

	/**
	 * Process an individual's leave request

	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	leave.execute = async ({ msg, args }) => {
		const { bot } = require('../pronto');

		// Ensure the command arguments are not empty, i.e. there is at least a remark included
		if (args.length === 0) return commandError(msg, 'Insufficient remarks.', leave.error);

		// If the first argument of the message command is 'for', execute commands\leaveFor.js instead
		if (args[0].toLowerCase() === 'for') return bot.commands.get(leaveFor.command).execute({ msg, args: args.slice(1) });

		// Success react to command message
		successReact(msg);

		// Create leave request embed
		const leaveEmbed = new Discord.MessageEmbed()
			.setTitle('Leave Request')
			.setColor(colours.leave)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setDescription(`**${msg.member.displayName}** has requested leave in **#${msg.channel.name}**`)
			.addField('Channel', msg.channel.toString())
			// Capitalise the first letter of the command arguments and add them to a 'Remarks' field
			.addField('Remarks', sentenceCase(args.join(' ')))
			.setFooter(await dateTimeGroup(guild));

		// Create confirmation embed
		const confirmationEmbed = new Discord.MessageEmbed()
			.setTitle('Leave Request')
			.setColor(colours.leave)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setDescription(`Hi **${msg.member.displayName}**, your submission of leave has been received.`)
			.addField('Channel', msg.channel.toString())
			.addField('Remarks', sentenceCase(args.join(' ')))
			.setFooter(await dateTimeGroup(guild));

		// Get the guild's attendance channel
		const attendanceChannel = bot.channels.cache.get(attendanceId);

		// Send the leave request and confirmation embeds
		sendMsg(attendanceChannel, { embeds: [leaveEmbed] });
		sendDirect(msg.author, { embeds: [confirmationEmbed] }, msg.channel);
	};

	return leave;
};