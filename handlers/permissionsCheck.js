'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { ids: { DEVELOPER_ID } } = require('../config');

/**
 * `handlers.permissionsCheck()` verifies whether a \<User> has the adequate permissions to access a specified command,
 * as per the truth table at https://imgur.com/a/iwiKpsG
 * @param {Discord.Collection<Discord.Snowflake, Discord.Role>} memberRoles The Collection\<Snowflake, Role> of the \<GuildMember>
 * @param {Discord.Snowflake} id The \<User>.id of the user to check permissions for
 * @param {Object.<string, string | string[] | boolean>} cmd The command object to check permissions against
 * @returns {boolean} Whether the \<User> has the adequate permissions to access the command
 */
module.exports = (memberRoles, id, cmd) => {
	// Check if the <GuildMember> has any explicitly denied roles
	const hasDeniedRoles = memberRoles.some(roles => cmd.deniedRoles.includes(roles.id));
	// Check if the <GuildMember> has any explicitly required roles
	const hasRequiredRoles = memberRoles.some(roles => cmd.requiredRoles.includes(roles.id));

	// If the <User> is the developer, they must have permission to access the command
	const isDeveloper = id === DEVELOPER_ID;
	// Check if the guild only has the denied roles <Role>.id[] populated
	const onlyDeniedRolesDefined = cmd.deniedRoles.length && !cmd.requiredRoles.length;

	// Return whether the <User> has permissions to access the command, as per the truth table at https://imgur.com/a/iwiKpsG
	return (isDeveloper || (!cmd.developerOnly && !hasDeniedRoles && (onlyDeniedRolesDefined || hasRequiredRoles)));
};