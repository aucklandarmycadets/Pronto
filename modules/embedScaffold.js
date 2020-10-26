'use strict';

const Discord = require('discord.js');
const { ids: { debugID } } = require('../config');

module.exports = (dest, descMsg, colour, type, fieldTitle, fieldContent, errorField) => {
	const { bot, version } = require('../pronto');
	const { charLimit, dtg, sendDM, sendMsg } = require('./');

	const debugChannel = bot.channels.cache.get(debugID);
	const devFooter = (type === 'dev')
		? ` | Pronto v${version}`
		: '';

	const embed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL())
		.setColor(colour)
		.setDescription(charLimit(descMsg, 2048))
		.setFooter(`${dtg()}${devFooter}`);

	if (fieldTitle) embed.addField(fieldTitle, fieldContent);
	if (errorField) embed.setDescription(charLimit(`${descMsg}\n${errorField}`, 2048));

	if (type === 'dm') sendDM(dest, embed, true);
	else if (type === 'dev') sendDM(dest, embed, true);
	else if (type === 'msg') sendMsg(dest, embed);
	else if (type === 'debug') debugChannel.send(embed).catch(error => console.error(error));
};