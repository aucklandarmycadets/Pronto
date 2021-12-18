'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

const { jsCodeBlock } = require('../modules');
const { embedScaffold, findGuildConfiguration } = require('../handlers');

/** */

/**
 *
 * @function handlers.debugError
 * @param {?Discord.Guild} guild The guild the member shares with the bot
 * @param {Error} error The error object
 * @param {string} errorMsg A string to display as an error message
 * @param {string} [fieldTitle] A title for an optional additional embed field
 * @param {string} [fieldContent] The field content for the optional embed field
 */
module.exports = async (guild, error, errorMsg, fieldTitle, fieldContent) => {
	const { colours } = await findGuildConfiguration();

	console.error(error);
	embedScaffold(guild, null, errorMsg, colours.error, 'DEBUG', fieldTitle, fieldContent, jsCodeBlock(error.stack));
};