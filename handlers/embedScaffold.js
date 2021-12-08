'use strict';

const Discord = require('discord.js');

const { charLimit, dateTimeGroup } = require('../modules');
const { findGuildConfiguration, sendDirect, sendMsg } = require('../handlers');

module.exports = async (guild, destination, description, colour, type, fieldTitle, fieldContent, errorField) => {
	const { bot, version } = require('../pronto');
	const { ids: { debugID } } = await findGuildConfiguration(guild);

	// Dynamically set footer to show current version for developer
	const developerFooter = (type === 'DEVELOPER')
		? ` | Pronto v${version}`
		: '';

	// Create embed with bot as author
	const embed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
		.setColor(colour)
		// Ensure embed payload does not exceed character limit
		.setDescription(charLimit(description, 2048))
		.setFooter(`${await dateTimeGroup()}${developerFooter}`);

	// Add additional fields if appropriate
	if (fieldTitle) embed.addField(fieldTitle, fieldContent);
	// Format error field into description if present
	if (errorField) embed.setDescription(charLimit(`${description}\n${errorField}`, 2048));

	// Get the guild's debug channel
	const debugChannel = bot.channels.cache.get(debugID);

	try {
		// Ensure there is a valid destination channel
		if ((destination && type !== 'DEBUG') || (debugChannel && type === 'DEBUG')) {
			if (type === 'DIRECT') sendDirect(destination, { embeds: [embed] }, null, true);
			else if (type === 'DEVELOPER') sendDirect(destination, { embeds: [embed] }, null, true);
			else if (type === 'MESSAGE') sendMsg(destination, { embeds: [embed] });
			else if (type === 'DEBUG') debugChannel.send({ embeds: [embed] }).catch(error => console.error(error));
		}
	}
	catch (error) { console.error(error); }
};