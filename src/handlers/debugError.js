'use strict';

const { jsCodeBlock } = require('../modules');
const { embedScaffold, findGuildConfiguration } = require('../handlers');

/** */

/**
 *
 * @function handlers.debugError
 * @param {Error} error The error object
 * @param {string} errorMsg A string to display as an error message
 * @param {string} [fieldTitle] A title for an optional additional embed field
 * @param {string} [fieldContent] The field content for the optional embed field
 */
module.exports = async (error, errorMsg, fieldTitle, fieldContent) => {
	const { colours } = await findGuildConfiguration();

	console.error(error);
	embedScaffold(null, null, errorMsg, colours.error, 'DEBUG', fieldTitle, fieldContent, jsCodeBlock(error.stack));
};