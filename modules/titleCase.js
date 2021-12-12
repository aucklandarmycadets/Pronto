'use strict';

/**
 * `modules.titleCase()` converts a specified string to title case
 *
 * @example
 * // returns 'Convert This Sentence To Title Case'
 * modules.titleCase('convert this sentence to title case');
 *
 * @function modules.titleCase
 * @param {string} str The string to convert
 * @returns {string} The string in title case
 */
module.exports = str => {
	// Split the string at each space character into a string[] of substrings
	return str.split(' ')
		// Capitalise the first letter of each substring
		.map(substr => substr.charAt(0).toUpperCase() + substr.slice(1))
		// Join the string[] separated by spaces, and return the new string
		.join(' ');
};