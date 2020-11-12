'use strict';

const Discord = require('discord.js');

module.exports = async (msg, errMsg, cmdErr, footer) => {
	const { errorReact, sendMsg } = require('./');
	const { colours } = await require('../handlers/database')(msg.guild);

	const authName = (msg.member)
		? msg.member.displayName
		: msg.author.username;

	const errorEmbed = new Discord.MessageEmbed()
		.setColor(colours.error)
		.setAuthor(authName, msg.author.displayAvatarURL({ dynamic: true }))
		.setDescription(`${msg.author} ${errMsg} ${cmdErr}`);

	if (footer) errorEmbed.setFooter(footer);

	errorReact(msg);
	sendMsg(msg.channel, errorEmbed);
};