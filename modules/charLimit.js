'use strict';

/**
 * `modules.charLimit()` ensures a provided string does not exceed the specified character limit
 * @example
 * // returns 'I will get trimmed...'
 * module.charLimit('I will get trimmed to 21 characters', 21);
 * @example
 * // returns '```Codeblock formatting is respected...```'
 * module.charLimit('```Codeblock formatting is respected by modules.charLimit()```', 42);
 * @function modules.charLimit
 * @param {string} str The string to trim if necessary
 * @param {number} [limit=2048] The allowed character limit
 * @returns {string | 'No message content'} The character-limited string, or `No message content` if no string was provided
 */
module.exports = (str, limit = 2048) => {
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