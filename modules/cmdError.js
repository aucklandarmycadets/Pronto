'use strict';

const Discord = require('discord.js');
const { colours } = require('../config');

module.exports = (msg, errMsg, cmdErr, footer) => {
	const { errorReact, sendMsg } = require('./');

	const authName = (msg.member)
		? msg.member.displayName
		: msg.author.username;

	const errorEmbed = new Discord.MessageEmbed()
		.setColor(colours.error)
		.setAuthor(authName, msg.author.displayAvatarURL())
		.setDescription(`${msg.author} ${errMsg} ${cmdErr}`);

	if (footer) errorEmbed.setFooter(footer);

	errorReact(msg);
	sendMsg(msg.channel, errorEmbed);
};