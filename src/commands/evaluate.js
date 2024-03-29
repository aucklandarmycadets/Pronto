/* eslint-disable no-unused-vars */
'use strict';

const Discord = require('discord.js');
const Typings = require('../typings');

const { dateTimeGroup, jsCodeBlock, ...modules } = require('../modules');
const { commandError, deleteMsg, findGuildConfiguration, sendMsg, ...handlers } = require('../handlers');

/**
 * @member {commands.Command} commands.evaluate Evaluate JavaScript code directly from a Discord message
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { commands: { evaluate, ...commands }, colours, _doc: config, ...document } = await findGuildConfiguration(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	evaluate.execute = async ({ msg, args }) => {
		const { bot } = require('../pronto');

		// Separate arguments by both spaces and newlines
		args = args.join(' ').split(/[ \n]+/);

		// Parse the short flags from the message, which consist of single letters that may be joined together under a single '-'
		// Construct a string[] of each individual flag letter
		const shortFlags = args.filter(arg => arg.match(/(?<![-a-zA-Z0-9])-[A-z]+(?![\s\S]*})/g))
			.flatMap(flags => [...flags.replace('-', '')]);

		// Flag for whether to display the evaluated result in a code block
		const codeBlock = !(args.includes('--no-code') || args.includes('--plain') || shortFlags.includes('P'));

		// Flag for whether to automatically include a 'return' statement in front of the code to evaluate
		const implicitReturn = !(args.includes('--no-implicit-return') || shortFlags.includes('R'));

		// Flag for whether to supress result
		const silent = (args.includes('--silent') || shortFlags.includes('s'));

		// Flag for whether to delete the command message
		if (args.includes('--delete') || shortFlags.includes('d')) deleteMsg(msg);

		// Filter out all flags from the message prior to evaluation
		// Use regex to ensure only flags containing letters are filtered, and not numbers or standalone '-' characters
		args = args.filter(arg => !arg.match(/(?<!(?<!--\w*)[a-zA-Z0-9])(-{1,2}[a-zA-Z]+)+/g));

		// If the arguments contain a codeblock, filter them out
		if (args.includes('```')) args = args.filter(arg => !arg.includes('```'));

		// If there is no code to evaluate, return an error
		if (args.length === 0) return commandError(msg, 'You must enter something to evaluate.', evaluate.error);

		// Join the processed arguments together to form the code to evaluate
		const code = args.join(' ');

		try {
			// Initialise an embed
			const embed = new Discord.MessageEmbed();

			// Only evaluate the code if there is no attempt to extract the bot token
			let result = (!code.toLowerCase().includes('token'))
				? await eval(`(async () => { ${(implicitReturn) ? 'return' : ''} ${code} })()`)
				: '*'.repeat(bot.token.length);

			// If the embed has been modified, automatically send it into the message channel
			if (code.includes('embed.')) sendMsg(msg.channel, { embeds: [embed] });

			// Supress result if flag was present
			if (silent) return;

			// If the evaluated result is not a string, convert it
			if (typeof result !== 'string') result = convertToString(result);

			// Attempt to remove any sensitive information from evaluated result
			// WARNING: This is primarily to prevent erroneous output, and IS NOT a robust implementation
			result = removeSensitive(result);

			// Pass the evaluated result into msgSplit(), breaking at the '},' substring
			// Remove any existing codeblocks, so they can be added again after the string has been split
			msgSplit(result.replace(/```j?s?/g, ''), '},');
		}

		// If there is an issue in the evaluation of the code, pass it into msgSplit(), breaking at the ')' substring
		catch (error) { msgSplit(error.stack, ')'); }

		/**
		 * Split a string into the necessary number of messages to accommodate for Discord's message character limit, splitting at a specified convenient substring
		 * @function commands.evaluate~msgSplit
		 * @param {string} str The string to split into (potentially) multiple messages
		 * @param {string} [substr] The substring at which to break
		 */
		function msgSplit(str, substr) {
			// Loop while the string has not yet been sent in its entirety
			while (str) {
				// The maximum index at which to break the message
				// This is the maximum character limit of a Discord <Message>
				const MAXIMUM_INDEX = 2000;

				// Use the codeblock boolean flag to determine whether to wrap result in a codeblock
				// If so, ensure the MAXIMUM_INDEX accounts for the codeblock characters
				const breakIndex = (codeBlock)
					? findBreakIndex(str, substr, MAXIMUM_INDEX - '```js\n```'.length)
					: findBreakIndex(str, substr, MAXIMUM_INDEX);

				// Wrap the message in a codeblock if flag is true, and send the message payload
				(codeBlock)
					? sendMsg(msg.channel, { content: jsCodeBlock(str.substr(0, breakIndex)) })
					: sendMsg(msg.channel, { content: str.substr(0, breakIndex) });

				// Remove the sent message content from the string before next iteration
				str = str.substr(breakIndex);
			}
		}
	};

	return evaluate;
};

/**
 * Convert an object (or other non-string type) to its string representation
 * @function commands.evaluate~convertToString
 * @param {Object | *} toConvert An object, or any other data type, to be inspected and converted into a string
 * @returns {string} A string representation of the input
 */
function convertToString(toConvert) {
	// Use util.inspect() to inspect and convert the data type to a string
	return require('util').inspect(toConvert);
}

/**
 * Censor sensitive information from an input string, and return the result
 * @function commands.evaluate~removeSensitive
 * @param {string} str The string to be censored
 * @returns {string} The resultant censored string
 */
function removeSensitive(str) {
	// Parse the githook through convertToString()
	const githook = convertToString(process.env.githook);
	// string[] of highly sensitive information to be censored
	// WARNING: This IS NOT a comprehensive or robust list
	// Strip the opening and closing {} from parsed githook string
	const sensitives = [process.env.TOKEN, githook.substr(1, githook.length - 2), process.env.SECRET, process.env.MONGOURI];

	// Loop through each sensitive string
	for (let i = 0; i < sensitives.length; i++) {
		// Replace any occurrences of the sensitive string with '*'
		// WARNING: This filter DOES NOT cover substrings of sensitive strings
		str = str.replace(new RegExp(sensitives[i], 'g'), '*'.repeat(sensitives[i].length));
	}

	// Return the censored string
	return str;
}

/**
 * Find the last occurrence of a given substring within a string to ensure a comfortable message split position
 * @function commands.evaluate~findBreakIndex
 * @param {string} str The string to search within
 * @param {?string} substr The substring at which to break
 * @param {number} maximumIndex The maximum length that the message can be
 * @returns {number} The index of the last occurrence of the substring
 */
function findBreakIndex(str, substr, maximumIndex) {
	// Find the last occurrence of the specified substring, but before the maximum index (accounting for the length of the substring itself)
	const substrIndex = str.lastIndexOf(substr, maximumIndex - substr.length);
	const hasSubstr = substrIndex !== -1;

	// Find the last occurrence of a ' ' character as a fallback
	const spaceIndex = str.lastIndexOf(' ', maximumIndex - 1);
	const hasSpace = spaceIndex !== -1;

	return (str.length > maximumIndex)
		// If the length of the string is greater than the maximum index and must be broken, follow the truthy tree
		? (hasSubstr)
			// If the substring is present, return the index immediately after the last occurrence of the substring
			? substrIndex + substr.length
			: (hasSpace)
				// Otherwise, return the index of the last space character if present
				? spaceIndex
				// If there is not a space character, break at the maximum index
				: maximumIndex
		// Otherwise, simply return the maximum index
		: maximumIndex;
}