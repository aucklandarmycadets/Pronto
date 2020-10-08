const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('../config');
const { config: { dateOutput }, ids: { attendanceID, tacPlus } } = config;
const { emojis: { successEmoji }, colours } = config;
const { cmds: { help, leave, leaveFor } } = require('../cmds');
const { pCmd, capitalise, cmdError, dmError, debugError } = require('../modules');

module.exports = {
	name: leaveFor.cmd,
	description: leaveFor.desc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const memberRoles = msg.member.roles.cache;
		const memberMentions = msg.mentions.members;
		const numMemberMentions = memberMentions.size;
		const absentee = memberMentions.first();

		if (!memberRoles.some(roles => tacPlus.includes(roles.id))) {
			bot.commands.get(help.cmd).execute(msg, args);
			return;
		}

		if (numMemberMentions === 0) {
			cmdError(msg, 'You must tag a user.', leaveFor.error);
		}

		else if (memberMentions.some(mention => mention.user.bot)) {
			cmdError(msg, 'You cannot submit leave for a bot!', leaveFor.error);
		}

		else if (numMemberMentions > 1) {
			cmdError(msg, 'You must submit leave individually.', leaveFor.error);
		}

		else if (args.length < 2) {
			cmdError(msg, 'Insufficient arguments.', leaveFor.error);
		}

		else {
			const leaveForEmbedTitle = 'Leave Request (For)';
			const messageAuthor = msg.author;
			const attendanceChannel = bot.channels.cache.get(attendanceID);
			const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

			msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

			const mentionIndex = args.indexOf(`<@!${absentee.user.id}>`);
			if (mentionIndex > -1) args.splice(mentionIndex, 1);

			const attendanceEmbed = new Discord.MessageEmbed()
				.setTitle(leaveForEmbedTitle)
				.setColor(colours.leave)
				.setAuthor(absentee.displayName, absentee.user.displayAvatarURL())
				.setDescription(`${messageAuthor} has submitted leave for ${absentee} in ${msg.channel}`)
				.addFields(
					{ name: 'Date', value: dateFormat(msg.createdAt, dateOutput) },
					{ name: 'Absentee', value: absentee },
					{ name: 'Details', value: capitalise(args.join(' ')) },
				);

			const dmEmbed = new Discord.MessageEmbed()
				.setTitle(leaveForEmbedTitle)
				.setColor(colours.leave)
				.setAuthor(msg.guild.name, msg.guild.iconURL())
				.setDescription(`Hi ${messageAuthor}, your submission of leave for ${absentee} has been received.`)
				.addFields(
					{ name: 'Date', value: dateFormat(msg.createdAt, dateOutput) },
					{ name: 'Channel', value: msg.channel.toString() },
					{ name: 'Details', value: capitalise(args.join(' ')) },
				);

			const absenteeEmbed = new Discord.MessageEmbed()
				.setTitle(leaveForEmbedTitle)
				.setColor(colours.leave)
				.setAuthor(msg.guild.name, msg.guild.iconURL())
				.setDescription(`${messageAuthor} has submitted leave for you in ${msg.channel}.`)
				.addFields(
					{ name: 'Date', value: dateFormat(msg.createdAt, dateOutput) },
					{ name: 'Channel', value: msg.channel.toString() },
					{ name: 'Details', value: capitalise(args.join(' ')) },
				)
				.setFooter(`Reply with ${pCmd(help)} ${leave.cmd} to learn how to request leave for yourself.`);

			attendanceChannel.send(attendanceEmbed);
			messageAuthor.send(dmEmbed).catch(error => dmError(msg, error));
			absentee.send(absenteeEmbed).catch(error => dmError(msg, error, true));
		}
	},
};