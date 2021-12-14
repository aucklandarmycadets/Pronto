'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { ids: { DEVELOPER_ID } } = require('../config');

/**
 * `handlers.permissionsCheck()` verifies whether a \<User> has the adequate permissions to access a specified \<Command>,
 * as per the truth table at https://imgur.com/a/iwiKpsG
 * @see https://imgur.com/a/iwiKpsG
 * @function handlers.permissionsCheck
 * @param {Discord.Collection<Discord.Snowflake, Discord.Role>} memberRoles The Collection\<Snowflake, Role> of the \<GuildMember>
 * @param {Discord.Snowflake} id The \<User.id> of the user to check permissions for
 * @param {Typings.BaseCommand} command The \<BaseCommand> object to check permissions against
 * @returns {boolean} Whether the \<User> has the adequate permissions to access the \<Command>
 */
module.exports = (memberRoles, id, command) => {
	// Check if the <GuildMember> has any explicitly denied roles
	const hasDeniedRoles = memberRoles.some(roles => command.deniedRoles.includes(roles.id));
	// Check if the <GuildMember> has any explicitly required roles
	const hasRequiredRoles = memberRoles.some(roles => command.requiredRoles.includes(roles.id));

	// If the <User> is the developer, they must have permission to access the <Command>
	const isDeveloper = id === DEVELOPER_ID;
	// Check if the guild only has the denied roles <Role.id[]> populated
	const onlyDeniedRolesDefined = command.deniedRoles.length && !command.requiredRoles.length;

	// Return whether the <User> has permissions to access the <Command>, as per the truth table at https://imgur.com/a/iwiKpsG
	return (isDeveloper || (!command.developerOnly && !hasDeniedRoles && (onlyDeniedRolesDefined || hasRequiredRoles)));
};