'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

/**
 * `modules.extract()` parses a \<User.id> from a potential \<UserMention | MemberMention> string
 * @example
 * // returns '192181901065322496'
 * modules.extractID('<@192181901065322496>');
 * @example
 * // returns false
 * modules.extractID('Pronto');
 * @function modules.extractID
 * @param {Discord.MemberMention | Discord.MemberMention | string} str The potential mention string
 * @returns {Discord.Snowflake | false} The parsed \<User.id>, or `false` if `str` is not a \<UserMention | MemberMention>
 */
module.exports = str => {
	// Attempt to match a <UserMention | MemberMention> pattern and capture the <User.id>
	const parsedID = str.match(/^<@!?(\d+)>$/);
	// If no snowflake was captured, return false
	if (!parsedID) return false;
	// Otherwise, return the captured <User.id> snowflake
	return parsedID[1];
};