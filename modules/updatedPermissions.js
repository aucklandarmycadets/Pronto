'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { difference } = require('../modules');

/**
 * `modules.updatedPermissions()` finds the difference between the \<Permissions> of two \<GuildMember | Role>
 * and returns it as a \<PermissionString[]>
 * @example
 * // <stateOne.permissions.toArray()> = ['MANAGE_CHANNELS', 'MANAGE_GUILD']
 * // <stateTwo.permissions.toArray()> = ['MANAGE_CHANNELS', 'MANAGE_MESSAGES']
 *
 * // returns ['MANAGE_GUILD', 'MANAGE_MESSAGES']
 * modules.updatedPermissions(<stateOne>, <stateTwo>);
 * @function modules.updatedPermissions
 * @param {Discord.GuildMember | Discord.Role} stateOne The old \<GuildMember | Role>
 * @param {Discord.GuildMember | Discord.Role} stateTwo The new \<GuildMember | Role>
 * @returns {Discord.PermissionString[]} The \<PermissionString[]> of the permissions that differ
 */
// Return the difference between the <PermissionString[]> of the old <GuildMember | Role> and the new <GuildMember | Role>
module.exports = (stateOne, stateTwo) => difference(stateOne.permissions.toArray(), stateTwo.permissions.toArray());