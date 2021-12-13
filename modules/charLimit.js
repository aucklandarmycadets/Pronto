'use strict';

/**
 * An object of known Discord API limits
 */
const DISCORD_LIMITS = {
	'MESSAGE': 2000,
	'EMBED_TITLE': 256,
	'EMBED_DESCRIPTION': 4096,
	'EMBED_FIELD_NAME': 256,
	'EMBED_FIELD_VALUE': 1024,
	'EMBED_FOOTER': 2048,
	'EMBED_AUTHOR': 256,
};

/**
 * `modules.charLimit()` ensures a provided string does not exceed the specified character limit
 *
 * @example
 * // returns 'I will get trimmed...'
 * modules.charLimit('I will get trimmed to 21 characters', null, 21);
 *
 * @example
 * // returns '```Codeblock formatting is respected...```'
 * modules.charLimit('```Codeblock formatting is respected by modules.charLimit()```', null, 42);
 *
 * @function modules.charLimit
 * @param {string} str The string to trim if necessary
 * @param {?'MESSAGE' | 'EMBED_TITLE' | 'EMBED_DESCRIPTION' | 'EMBED_FIELD_NAME' | 'EMBED_FIELD_VALUE' | 'EMBED_FOOTER' | 'EMBED_AUTHOR'} type The indended purpose of the string
 * - If specified, the limit will be retrieved from an object of known API limits
 * - **NOTE:** If a `limit` is also specified, this argument will be ignored and the `limit` will be applied
 * @param {number} [limit] The allowed character limit
 * @returns {string | 'No message content'} The character-limited string, or `No message content` if no string was provided
 */
module.exports = (str, type, limit) => {
	// If no limit was provided, and the specified type is a valid key in DISCORD_LIMITs, assign the known API limit
	if (!limit && DISCORD_LIMITS[type]) limit = DISCORD_LIMITS[type];

	str = (str.length > limit)
		// If the provided string is longer than the allowed character limit, check if the portion to be trimmed contains a codeblock ending (```)
		? (str.slice(-(str.length - limit)).includes('```'))
			// If it does, slice the string to the allowed limit, accounting for both an ellipsis and three backticks (```) to end the codeblock
			? `${str.slice(0, limit - 6)}...\`\`\``
			// Otherwise, slice the string to the allowed limit, accounting for an ellipsis
			: `${str.slice(0, limit - 3)}...`
		// Otherwise, if the string does not exceed the character limit, don't change it
		: str;

	return (str.length)
		// If the string is not empty, return the character-limited string
		? str
		// Otherwise, return 'No message content'
		: 'No message content';
};