'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup, updatedPermissions } = require('../modules');
const { database, sendMsg, verifyBotPermissions } = require('../handlers');

/**
 * @member {events.EventModule} events.onRoleUpdate Event handler to log whenever a guild \<Role> is updated
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['roleUpdate'],
	process: [],
	/**
	 * @param {'roleUpdate'} _ The event that was emitted
	 * @param {Discord.Role} oldRole The \<Role> before the update
	 * @param {Discord.Role} newRole The \<Role> after the update
	 */
	async handler(_, oldRole, newRole) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await database(newRole.guild);

		// Initialise log embed
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(newRole.guild.name, newRole.guild.iconURL({ dynamic: true }))
			.setFooter(`ID: ${newRole.id} | ${await dateTimeGroup()}`);

		if (oldRole.color !== newRole.color) {
			// If the <Role> colour has changed, set the log embed accordingly
			logEmbed.setColor(newRole.color);
			logEmbed.setDescription(`**Role colour ${newRole} changed**`);
			logEmbed.addField('Before', oldRole.hexColor);
			logEmbed.addField('After', newRole.hexColor);
		}

		else if (oldRole.name !== newRole.name) {
			// Otherwise, if the <Role> name has changed, set the log embed accordingly
			logEmbed.setColor(colours.warn);
			logEmbed.setDescription(`**Role name ${newRole} changed**`);
			logEmbed.addField('Before', oldRole.name);
			logEmbed.addField('After', newRole.name);
		}

		else if (oldRole.permissions !== newRole.permissions) {
			// Otherwise, if the <Role> permissions have changed, set the log embed accordingly
			logEmbed.setColor(colours.warn);
			logEmbed.setDescription(`**Role permissions ${newRole} changed**`);

			// Get the <PermissionString[]> of the old <Role> permissions
			const oldPermissions = oldRole.permissions.toArray();
			// Use modules.updatedPermissions() to get the <PermissionString[]> of the difference between the two <Role> objects
			const changedPermissions = updatedPermissions(oldRole, newRole);

			// Filter the <PermissionString[]> difference for removed permissions, i.e. the ones which exist in the old <Role> permissions
			const removedPermissions = changedPermissions.filter(permission => oldPermissions.includes(permission));
			// Filter the <PermissionString[]> difference for added permissions, i.e the ones which don't exist in the old <Role> permissions
			const addedPermissions = changedPermissions.filter(permission => !oldPermissions.includes(permission));

			// Ensure there were some added/removed permissions that were successfully filtered, otherwise cease further execution
			// This line is necessary as a <Role.position> change may enter this if-else block, but with no differences between <PermissionString[]>
			if (!addedPermissions.length && !removedPermissions.length) return;
			// If there were permissions added, add a field to the log embed to list the added permissions
			if (addedPermissions.length > 0) logEmbed.addField('Added Permissions', addedPermissions.join('\n'));
			// If there were permissions removed, add a field to the log embed to list the removed permissions
			if (removedPermissions.length > 0) logEmbed.addField('Removed Permissions', removedPermissions.join('\n'));

			// If the bot's <GuildMember> has the <Role> that has changed, call handlers.verifyBotPermissions() to ensure the bot has the necessary <Discord.Permissions>
			if (newRole.guild.me.roles.cache.get(newRole.id)) verifyBotPermissions(newRole.guild, changedPermissions);
		}

		// For any other actions which may have emitted <Client>#roleUpdate, cease further execution
		else return;

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });
	},
};