'use strict';

/**
 * `modules.jsCodeBlock()` formats a specified string into a Markdown codeblock with JavaScript syntax highlighting
 * @example
 * // returns '```js\nconsole.log("Hello world!")```'
 * modules.jsCodeBlock('console.log("Hello world!")');
 * @function modules.jsCodeBlock
 * @param {string} str The string to format
 * @returns {string} The string formatted into a Markdown JavaScript codeblock
 */
// Wrap the specified string with backticks, and specify 'js' as the language
module.exports = str => '```js\n' + str + '```';