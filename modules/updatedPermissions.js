'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { difference } = require('../modules');

/**
 * Find the difference between the \<Permissions> of two \<GuildMember | Role> and return it as a \<PermissionString[]>
 * @function modules.updatedPermissions
 * @param {Discord.GuildMember | Discord.Role} stateOne The old \<GuildMember | Role>
 * @param {Discord.GuildMember | Discord.Role} stateTwo The new \<GuildMember | Role>
 * @returns {Discord.PermissionString[]} The \<PermissionString[]> of the permissions that differ
 */
// Return the difference between the <PermissionString[]> of the old <GuildMember | Role> and the new <GuildMember | Role>
module.exports = (stateOne, stateTwo) => difference(stateOne.permissions.toArray(), stateTwo.permissions.toArray());