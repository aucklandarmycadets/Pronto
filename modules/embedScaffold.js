'use strict';

const Discord = require('discord.js');

module.exports = async (dest, descMsg, colour, type, fieldTitle, fieldContent, errorField) => {
	const { bot, version } = require('../pronto');
	const { charLimit, dtg, sendDM, sendMsg } = require('./');
	const { ids: { debugID } } = await require('../handlers/database')();

	const debugChannel = bot.channels.cache.get(debugID);
	const devFooter = (type === 'dev')
		? ` | Pronto v${version}`
		: '';

	const embed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
		.setColor(colour)
		.setDescription(charLimit(descMsg, 2048))
		.setFooter(`${await dtg()}${devFooter}`);

	if (fieldTitle) embed.addField(fieldTitle, fieldContent);
	if (errorField) embed.setDescription(charLimit(`${descMsg}\n${errorField}`, 2048));

	try {
		if (dest || debugChannel) {
			if (type === 'dm') sendDM(dest, embed, null, true);
			else if (type === 'dev') sendDM(dest, embed, null, true);
			else if (type === 'msg') sendMsg(dest, embed);
			else if (type === 'debug') debugChannel.send(embed).catch(error => console.error(error));
		}
	}
	catch (error) { console.error(error); }
};