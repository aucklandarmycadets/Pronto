'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { findGuildConfiguration } = require('../handlers');

/**
 * `modules.sortMembersByRoles()` returns a `compareFunction` for `Collection<Snowflake, GuildMember>.sort()`
 * that sorts the members in descending order of highest role
 *
 * @example
 * // guild = <Guild>
 *
 * // Sorts a Collection<Snowflake, GuildMember> in descending order of highest role
 * Collection<Snowflake, GuildMember>.sort(modules.sortMembersByRoles(guild));
 *
 * @function modules.sortMembersByRoles
 * @param {Discord.Guild} guild The \<Guild> that the members belong to
 * - If the guild's [`<GuildConfiguration.ids.administratorID>`]{@link models.GuildConfiguration} is registered, it will be ignored in the sort order
 * @returns {function(Discord.GuildMember, Discord.GuildMember):number} The `compareFunction` to be passed to the `Collection<Snowflake, GuildMember>.sort()` method
 */
module.exports = async guild => {
	const { ids: { administratorID } } = await findGuildConfiguration(guild);

	/**
	 * Find the highest, non-administrator \<Role> of a specified \<GuildMember>
	 * @function modules.sortMembersByRoles~highestRole
	 * @param {Discord.GuildMember} member The \<GuildMember> to find the highest non-administrator \<Role> for
	 * @returns {Discord.Role} The highest non-administrator \<Role> of the \<GuildMember>
	 */
	const highestRole = member => (member.roles.highest.id === administratorID)
		// If the identifier of the member's highest role matches the registered administratorID in the <GuildConfiguration>,
		// find the highest non-administrator <Role>
		? member.roles.cache.filter(role => role.id !== administratorID).sort((roleOne, roleTwo) => roleOne.position - roleTwo.position).last()
		// Otherwise, return the <GuildMemberRoleManager.highest>
		: member.roles.highest;

	// Return a function that calculates the difference between the positions of the highest roles of two members
	// If memberTwo's highest role is higher than memberOne's, the function will return > 0
	// If memberTwo's highest role is equal to memberOne's, the function will return 0
	// If memberTwo's highest role is lower than memberOne's, the function will return < 0
	return (memberOne, memberTwo) => highestRole(memberTwo).position - highestRole(memberOne).position;
};