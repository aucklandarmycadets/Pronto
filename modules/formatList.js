'use strict';

/**
 * `modules.formatList()` formats a supplied `listObject` into a formatted list string
 *
 * @example
 * // returns {string}:
 * // **KeyOne:** ValueOne\n
 * // **KeyTwo:** ValueTwo
 * modules.formatList({
 *	'KeyOne': 'ValueOne',
 *	'KeyTwo': 'ValueTwo',
 * });
 *
 * @example
 * // returns {string}:
 * // `KeyOne` - ValueOne\n
 * // `KeyTwo` - ValueTwo
 * modules.formatList({
 *	'KeyOne': 'ValueOne',
 *	'KeyTwo': 'ValueTwo',
 * }, ['`', '` - ']);
 *
 * @function modules.formatList
 * @param {Object.<string, string>} listObject The list object to convert into a formatted list
 * - Each [key, value] pair in the object represents the 'key: value' of each list entry
 * @param {string[]} [format=['**', ':** ']] The formatting to apply [before, after] each key in the list
 * @returns {string} The newline-separated list string
 */
module.exports = (listObject, [beforeFormat = '**', afterFormat = ':** ']) => {
	// Map each list value to a new string[] of formatted strings, then join the string[] with a newline separator
	return Object.entries(listObject)
		.map(([key, value]) => `${beforeFormat}${key}${afterFormat}${value}`)
		.join('\n');
};