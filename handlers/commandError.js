'use strict';

const Discord = require('discord.js');
const { errorReact, findGuildConfiguration, sendMsg } = require('../handlers');

/** */

/**
 *
 * @function handlers.commandError
 * @param {Discord.Message} msg Erroneous command message
 * @param {string} errorMsg Error message to display
 * @param {string} commandError The error text to display for the command
 * @param {string} [footer] Optional supplementary footer
 */
module.exports = async (msg, errorMsg, commandError, footer) => {
	const { colours } = await findGuildConfiguration(msg.guild);

	const authName = (msg.member)
		? msg.member.displayName
		: msg.author.username;

	const errorEmbed = new Discord.MessageEmbed()
		.setColor(colours.error)
		.setAuthor(authName, msg.author.displayAvatarURL({ dynamic: true }))
		.setDescription(`${msg.author} ${errorMsg} ${commandError}`);

	if (footer) errorEmbed.setFooter(footer);

	errorReact(msg);
	sendMsg(msg.channel, { embeds: [errorEmbed] });
};