'use strict';

const Discord = require('discord.js');

module.exports = async (guild, destination, description, colour, type, fieldTitle, fieldContent, errorField) => {
	const { bot, version } = require('../pronto');
	const { charLimit, dtg, sendDM, sendMsg } = require('./');
	const { ids: { debugID } } = await require('../handlers/database')(guild);

	// Get debug channel
	const debugChannel = bot.channels.cache.get(debugID);
	// Dynamically set footer to show current version for developer
	const devFooter = (type === 'dev')
		? ` | Pronto v${version}`
		: '';

	// Create embed with bot as author
	const embed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
		.setColor(colour)
		// Ensure embed payload does not exceed character limit
		.setDescription(charLimit(description, 2048))
		.setFooter(`${await dtg()}${devFooter}`);

	// Add additional fields if appropriate
	if (fieldTitle) embed.addField(fieldTitle, fieldContent);
	// Format error field into description if present
	if (errorField) embed.setDescription(charLimit(`${description}\n${errorField}`, 2048));

	try {
		// Ensure there is a valid destination channel
		if (destination || debugChannel) {
			if (type === 'dm') sendDM(destination, { embeds: [embed] }, null, true);
			else if (type === 'dev') sendDM(destination, { embeds: [embed] }, null, true);
			else if (type === 'msg') sendMsg(destination, { embeds: [embed] });
			else if (type === 'debug') debugChannel.send({ embeds: [embed] }).catch(error => console.error(error));
		}
	}
	catch (error) { console.error(error); }
};