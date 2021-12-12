'use strict';

/**
 * `modules.sentenceCase()` converts a specified string to sentence case
 *
 * @example
 * // returns 'Convert this sentence to sentence case'
 * modules.sentenceCase('convert this sentence to sentence case');
 *
 * @function modules.sentenceCase
 * @param {string} str The string to convert
 * @returns {string} The string in sentence case
 */
// Extract and capitalise the first letter, then append the rest of the string to it
module.exports = str => str.charAt(0).toUpperCase() + str.slice(1);