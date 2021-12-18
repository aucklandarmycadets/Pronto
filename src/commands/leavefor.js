'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup, prefixCommand, remove, sentenceCase } = require('../modules');
const { commandError, findGuildConfiguration, sendDirect, sendMsg, successReact } = require('../handlers');

/**
 * @member {commands.Command} commands.leavefor Process a leave request submitted on behalf of someone else
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { attendanceId }, commands: { help, leave, leaveFor }, colours } = await findGuildConfiguration(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	leaveFor.execute = async ({ msg, args }) => {
		const { bot } = require('../pronto');

		// Extract the mentioned absentee from the command message
		const absentee = msg.mentions.members.first();

		try {
			// Ensure there was at least one <GuildMember> mentioned
			if (msg.mentions.members.size === 0) throw 'You must tag a user.';

			// Ensure no mentioned members are a bot
			else if (msg.mentions.members.some(mention => mention.user.bot)) throw 'You cannot submit leave for a bot!';

			// Ensure there was only member mentioned
			else if (msg.mentions.members.size > 1) throw 'You must submit leave individually.';

			// Ensure there are at least some remarks
			else if (args.length < 2) throw 'Insufficient remarks.';
		}

		catch (thrownError) { return commandError(msg, thrownError, leaveFor.error); }

		// Success react to command message
		successReact(msg);

		// Remove the mentioned <GuildMember> from the command arguments
		args = remove(args, `<@!${absentee.user.id}>`);

		// Create leave request embed
		const attendanceEmbed = new Discord.MessageEmbed()
			.setTitle('Leave Request (For)')
			.setColor(colours.leave)
			.setAuthor(absentee.displayName, absentee.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`**${msg.member.displayName}** has submitted leave for **${absentee.displayName}** in **#${msg.channel.name}**`)
			.addFields(
				{ name: 'Absentee', value: absentee.toString() },
				{ name: 'Channel', value: msg.channel.toString() },
				// Capitalise the first letter of the command arguments and add them to a 'Remarks' field
				{ name: 'Remarks', value: sentenceCase(args.join(' ')) },
			)
			.setFooter(await dateTimeGroup(guild));

		// Create confirmation embed
		const directEmbed = new Discord.MessageEmbed()
			.setTitle('Leave Request (For)')
			.setColor(colours.leave)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setDescription(`Hi **${msg.member.displayName}**, your submission of leave for **${absentee.displayName}** has been received.`)
			.addField('Channel', msg.channel.toString())
			.addField('Remarks', sentenceCase(args.join(' ')))
			.setFooter(await dateTimeGroup(guild));

		// Create notice embed to inform absentee that a request has been made on their behalf
		const absenteeEmbed = new Discord.MessageEmbed()
			.setTitle('Leave Request (For)')
			.setColor(colours.leave)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setDescription(`**${msg.member.displayName}** has submitted leave for you in **#${msg.channel.name}**.`)
			.addField('Channel', msg.channel.toString())
			.addField('Remarks', sentenceCase(args.join(' ')))
			.setFooter(`Reply with '${await prefixCommand(help, guild)} ${leave.command}' to learn how to request leave for yourself.`);

		// Get the guild's attendance channel
		const attendanceChannel = bot.channels.cache.get(attendanceId);

		// Send the embeds to their respective destinations
		sendMsg(attendanceChannel, { embeds: [attendanceEmbed] });
		sendDirect(msg.author, { embeds: [directEmbed] }, msg.channel);
		sendDirect(absentee, { embeds: [absenteeEmbed] }, msg.channel, true);
	};

	return leaveFor;
};