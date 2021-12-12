'use strict';

/**
 * `modules.formatList()` formats a supplied `listObject` into a formatted list string
 * @example
 * // returns {string}:
 * // **KeyOne:** ValueOne\n
 * // **KeyTwo:** ValueTwo
 * modules.formatList({
 *	'KeyOne': 'ValueOne',
 *	'KeyTwo': 'ValueTwo',
 * });
 * @example
 * // returns {string}:
 * // `KeyOne` - ValueOne\n
 * // `KeyTwo` - ValueTwo
 * modules.formatList({
 *	'KeyOne': 'ValueOne',
 *	'KeyTwo': 'ValueTwo',
 * }, true);
 * @function modules.formatList
 * @param {Object.<string, string>} listObject The list object to convert into a formatted list
 * - Each [key, value] pair in the object represents the 'key: value' of each list entry
 * @param {boolean} [forCommandsList] Whether the list should be formatted appropriately for the commands list
 * @returns {string} The newline-separated list string
 */
module.exports = (listObject, forCommandsList) => {
	// Dynamically set the startFormat and endFormat depending on whether the list is for the commands list
	const [startFormat, endFormat] = (forCommandsList)
		? ['`', '` - ']
		: ['**', ':** '];

	// Map each list value to a new string[] of formatted strings, then join the string[] with a newline separator
	return Object.entries(listObject)
		.map(([key, value]) => `${startFormat}${key}${endFormat}${value}`)
		.join('\n');
};