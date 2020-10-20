const Discord = require('discord.js');

const { ids: { attendanceID }, emojis: { successEmoji }, colours } = require('../config');
const { cmds: { leave } } = require('../cmds');
const { capitalise, dtg, cmdError, sendMsg, dmError, debugError } = require('../modules');

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
		.addField('Details', capitalise(args.join(' ')))
		.setFooter(dtg());

	const dmEmbed = new Discord.MessageEmbed()
		.setTitle(leaveEmbedTitle)
		.setColor(colours.leave)
		.setAuthor(msg.guild.name, msg.guild.iconURL())
		.setDescription(`Hi ${messageAuthor}, your submission of leave has been received.`)
		.addField('Details', capitalise(args.join(' ')))
		.setFooter(dtg());

	sendMsg(attendanceChannel, attendanceEmbed);
	messageAuthor.send(dmEmbed).catch(error => dmError(msg, error));
};