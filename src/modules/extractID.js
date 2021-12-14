'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

/**
 * `modules.extractId()` parses a \<User.id> from a potential \<UserMention | MemberMention> string
 *
 * @example
 * // returns '192181901065322496'
 * modules.extractId('<@192181901065322496>');
 *
 * @example
 * // returns false
 * modules.extractId('Pronto');
 *
 * @function modules.extractId
 * @param {Discord.MemberMention | Discord.MemberMention | string} str The potential mention string
 * @returns {Discord.Snowflake | false} The parsed \<User.id>, or `false` if `str` is not a \<UserMention | MemberMention>
 */
module.exports = str => {
	// Attempt to match a <UserMention | MemberMention> pattern and capture the <User.id>
	const parsedId = str.match(/^<@!?(\d+)>$/);
	// If no snowflake was captured, return false
	if (!parsedId) return false;
	// Otherwise, return the captured <User.id> snowflake
	return parsedId[1];
};