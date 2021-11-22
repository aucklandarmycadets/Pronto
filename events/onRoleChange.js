'use strict';

const Discord = require('discord.js');
const { dtg, sendMsg, updatedPermissions } = require('../modules');
const { botPermsHandler } = require('../handlers');

module.exports = {
	events: ['roleUpdate'],
	process: [],
	async handler(_, oldRole, newRole) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(newRole.guild);

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed();

		if (oldRole.color !== newRole.color) {
			logEmbed.setColor(newRole.color);
			logEmbed.setDescription(`**Role colour ${newRole} changed**`);
			logEmbed.addField('Before', oldRole.hexColor);
			logEmbed.addField('After', newRole.hexColor);
		}

		else if (oldRole.name !== newRole.name) {
			logEmbed.setColor(colours.warn);
			logEmbed.setDescription(`**Role name ${newRole} changed**`);
			logEmbed.addField('Before', oldRole.name);
			logEmbed.addField('After', newRole.name);
		}

		else if (oldRole.permissions !== newRole.permissions) {
			logEmbed.setColor(colours.warn);
			logEmbed.setDescription(`**Role permissions ${newRole} changed**`);

			const oldPerms = oldRole.permissions.toArray();
			const changedPerms = updatedPermissions(newRole, oldRole);

			const removedPerms = changedPerms.filter(permission => oldPerms.includes(permission));
			const addedPerms = changedPerms.filter(permission => !oldPerms.includes(permission));

			if (!addedPerms.length && !removedPerms.length) return;
			if (addedPerms.length > 0) logEmbed.addField('Added Permissions', addedPerms.join('\n'));
			if (removedPerms.length > 0) logEmbed.addField('Removed Permissions', removedPerms.join('\n'));

			const botRoles = newRole.guild.me.roles.cache;

			if (botRoles.some(role => role.id === newRole.id)) botPermsHandler(newRole.guild, changedPerms);
		}

		else return;

		logEmbed.setAuthor(newRole.guild.name, newRole.guild.iconURL({ dynamic: true }));
		logEmbed.setFooter(`ID: ${newRole.id} | ${await dtg()}`);
		sendMsg(log, { embeds: [logEmbed] });
	},
};