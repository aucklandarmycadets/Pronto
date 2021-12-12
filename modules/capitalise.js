'use strict';

/**
 * `modules.capitalise()` capitalises the first letter of a string and returns it
 * @example
 * // returns 'Capitalise this sentence'
 * module.capitalise('capitalise this sentence');
 * @function modules.capitalise
 * @param {string} str The string to capitalise
 * @returns {string} The capitalised string
 */
// Extract and capitalise the first letter, then append the rest of the string to it
module.exports = str => str.charAt(0).toUpperCase() + str.slice(1);