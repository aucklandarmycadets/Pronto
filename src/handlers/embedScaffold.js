'use strict';

const Discord = require('discord.js');

const { charLimit, dateTimeGroup } = require('../modules');
const { findGuildConfiguration, sendDirect, sendMsg } = require('../handlers');

/** */

/**
 *
 * @function handlers.embedScaffold
 * @param {?Discord.Guild} guild The guild the member shares with the bot
 * @param {?Discord.TextBasedChannels | Discord.User | Discord.GuildMember} destination The TextBasedChannel to send the embed to
 * @param {string} description The description of the embed to be created
 * @param {Discord.ColorResolvable} colour The colour of the embed to be created
 * @param {'MESSAGE' | 'DIRECT' | 'DEVELOPER' | 'DEBUG'} type The intended purpose of the embed
 * @param {?string} [fieldTitle] A title for an optional embed field
 * @param {?string} [fieldContent] Embed field content
 * @param {string} [errorField] An optional additional error message to append to the end of the description
 */
module.exports = async (guild, destination, description, colour, type, fieldTitle, fieldContent, errorField) => {
	const { bot, version } = require('../pronto');
	const { ids: { debugId } } = await findGuildConfiguration(guild);

	// Dynamically set footer to show current version for developer
	const developerFooter = (type === 'DEVELOPER')
		? ` | Pronto v${version}`
		: '';

	// Create embed with bot as author
	const embed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
		.setColor(colour)
		// Ensure embed payload does not exceed character limit
		.setDescription(charLimit(description, 'EMBED_DESCRIPTION'))
		.setFooter(`${await dateTimeGroup(guild)}${developerFooter}`);

	// Add additional fields if appropriate
	if (fieldTitle) embed.addField(fieldTitle, fieldContent);
	// Format error field into description if present
	if (errorField) embed.setDescription(charLimit(`${description}\n${errorField}`, 'EMBED_DESCRIPTION'));

	// Get the guild's debug channel
	const debugChannel = bot.channels.cache.get(debugId);

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