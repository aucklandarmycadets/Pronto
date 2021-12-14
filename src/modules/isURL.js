'use strict';

/**
 * `modules.isURL()` uses the `URL()` constructor to validate whether a specified string is a valid URL
 *
 * @example
 * // returns true
 * modules.isURL('https://github.com/JamesNZL/Pronto');
 *
 * @example
 * // returns false
 * modules.isURL('i.am.not.a.url');
 *
 * @function modules.isURL
 * @param {string} str The string to validate
 * @returns {boolean} Whether the string is a valid URL
 */
module.exports = str => {
	// Attempt to construct a new URL object using the specified string
	try { new URL(str); }
	// If an exception is thrown, the specified string must not be a valid URL
	catch { return false; }

	// If no exception is thrown, the specified string must be a valid URL
	return true;
};