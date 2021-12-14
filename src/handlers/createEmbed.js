'use strict';

const Discord = require('discord.js');

/** */

/**
 *
 * @function handlers.createEmbed
 * @param {string} prompt The prompt to display as the embed description
 * @param {Discord.ColorResolvable} [colour] The colour to set the embed to
 * @returns {Discord.MessageEmbed} The created embed
 */
module.exports = (prompt, colour) => {
	return new Discord.MessageEmbed()
		.setColor(colour)
		.setDescription(prompt);
};