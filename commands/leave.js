const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('../config');
const { config: { dateOutput }, ids: { attendanceID } } = config;
const { emojis: { successEmoji }, colours } = config;
const { cmds: { leave } } = require('../cmds');
const { capitalise, cmdError, sendMsg, dmError, debugError } = require('../modules');

module.exports = leave;
module.exports.execute = (msg, args) => {
	'use strict';

	const { bot } = require('../pronto.js');

	if (args.length === 0) return cmdError(msg, 'Insufficient arguments.', leave.error);

	const leaveEmbedTitle = 'Leave Request';
	const messageAuthor = msg.author;
	const attendanceChannel = bot.channels.cache.get(attendanceID);
	const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

	msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

	const attendanceEmbed = new Discord.MessageEmbed()
		.setTitle(leaveEmbedTitle)
		.setColor(colours.leave)
		.setAuthor(msg.member.displayName, messageAuthor.displayAvatarURL())
		.setDescription(`${messageAuthor} has requested leave in ${msg.channel}`)
		.addFields(
			{ name: 'Date', value: dateFormat(msg.createdAt, dateOutput) },
			{ name: 'Details', value: capitalise(args.join(' ')) },
		);

	const dmEmbed = new Discord.MessageEmbed()
		.setTitle(leaveEmbedTitle)
		.setColor(colours.leave)
		.setAuthor(msg.guild.name, msg.guild.iconURL())
		.setDescription(`Hi ${messageAuthor}, your submission of leave has been received.`)
		.addFields(
			{ name: 'Date', value: dateFormat(msg.createdAt, dateOutput) },
			{ name: 'Channel', value: msg.channel.toString() },
			{ name: 'Details', value: capitalise(args.join(' ')) },
		);

	sendMsg(attendanceChannel, attendanceEmbed);
	messageAuthor.send(dmEmbed).catch(error => dmError(msg, error));
};