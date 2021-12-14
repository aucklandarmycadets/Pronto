'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

/**
 * `modules.formatRoles()` formats a \<Snowflake[] | Role[]> into a formatted string of role mentions (or escaped mentions)
 *
 * @example
 * // returns {string}:
 * // @\u200bJames @\u200bAdministrators\n
 * // @\u200bModerators
 * modules.formatRoles(['285282768286646272', '285283460078239785', '285283751695745033'], false, 2);
 *
 * @example
 * // returns '<@&285282768286646272> <@&285283460078239785> <@&285283751695745033>'
 * modules.formatRoles(['285282768286646272', '285283460078239785', '285283751695745033'], true);
 *
 * @function modules.formatRoles
 * @param {Discord.Snowflake[] | Discord.Role[]} array A \<Role.id[] | Role[]> to convert into a formatted string
 * @param {boolean} [mention=false] Whether to mention the roles, or escape the mentions
 * @param {number} [breakAt] The number of roles to allow on each line, before inserting a line break
 * @returns {string} The formatted string of role mentions
 */
module.exports = (array, mention = false, breakAt) => {
	const { bot } = require('../pronto');

	if (typeof array[0] === 'string') {
		// If the array is a <Role.id[]>, find the guild that the roles belong to
		const guild = bot.guilds.cache.find(_guild => _guild.roles.cache.get(array[0]));

		// Map each <Role.id> to its <Role> object and replace the original array
		array = array.map(roleId => guild.roles.cache.get(roleId));
	}

	// Filter @everyone from the <Role[]>
	return array.filter(role => role.name !== '@everyone')
		// Reduce the filtered array into a single formatted string and return it
		// If the current index % breakAt equals zero, a newline must be inserted
		// If the mentions must be escaped, then format the <Role.name> rather than <Role.toString()>, inserting an invisible space between the <Role.name> and the @ symbol
		.reduce((mentions, role, i) => mentions + `${(i % breakAt === 0) ? '\n' : ''}${(mention) ? `${role} ` : `@\u200b${role.name.replace('@', '')} `}`, '');
};