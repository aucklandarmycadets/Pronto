'use strict';

const Discord = require('discord.js');
const { capitalise, cmdError, dateTimeGroup, sendDirect, sendMsg, successReact } = require('../modules');

/**
 * Attach the cmd.execute() function to command object
 * @module commands/leave
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Object.<string, string | string[] | boolean | Function>>} The complete command object with a cmd.execute() property
 */
module.exports = async guild => {
	const { ids: { attendanceID }, cmds: { leave, leaveFor }, colours } = await require('../handlers/database')(guild);

	/**
	 * Process an individual's leave request
	 * @param {Discord.Message} msg The \<Message> that executed the command
	 * @param {string[]} args The command arguments
	 */
	leave.execute = async (msg, args) => {
		const { bot } = require('../pronto');

		// Ensure the command arguments are not empty, i.e. there is at least a remark included
		if (args.length === 0) return cmdError(msg, 'Insufficient remarks.', leave.error);

		// If the first argument of the message command is 'for', execute commands\leaveFor.js instead
		if (args[0].toLowerCase() === 'for') return bot.commands.get(leaveFor.cmd).execute(msg, args.slice(1));

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
			.addField('Remarks', capitalise(args.join(' ')))
			.setFooter(await dateTimeGroup());

		// Create confirmation embed
		const confirmationEmbed = new Discord.MessageEmbed()
			.setTitle('Leave Request')
			.setColor(colours.leave)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setDescription(`Hi **${msg.member.displayName}**, your submission of leave has been received.`)
			.addField('Channel', msg.channel.toString())
			.addField('Remarks', capitalise(args.join(' ')))
			.setFooter(await dateTimeGroup());

		// Get the guild's attendance channel
		const attendanceChannel = bot.channels.cache.get(attendanceID);

		// Send the leave request and confirmation embeds
		sendMsg(attendanceChannel, { embeds: [leaveEmbed] });
		sendDirect(msg.author, { embeds: [confirmationEmbed] }, msg.channel);
	};

	return leave;
};