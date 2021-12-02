'use strict';

const Discord = require('discord.js');
const { settings: { PERMISSIONS_INTEGER } } = require('../config');
const { embedScaffold } = require('../modules');

const currentlyMissing = new Set();

module.exports = async (guild, changes) => {
	const { ids: { guildID }, colours } = await require('./database')(guild);

	if (!guildID) return;

	const requiredPermissions = new Discord.Permissions(PERMISSIONS_INTEGER);
	const botPermissions = guild.me.permissions;
	const hasRequired = botPermissions.has(requiredPermissions);

	const missingPermissions = [...new Set([...requiredPermissions].filter(value => !botPermissions.has(value)))];

	if (!hasRequired) {
		currentlyMissing.add(guild.id);
		embedScaffold(guild, null, 'I do not have my minimum permissions!', colours.error, 'DEBUG', 'Missing Permissions', missingPermissions);
	}

	else if (changes && currentlyMissing.has(guild.id)) {
		const requiredArray = requiredPermissions.toArray();

		for (let i = 0; i < changes.length; i++) {
			if (requiredArray.includes(changes[i])) {
				embedScaffold(guild, null, 'Permissions resolved.', colours.success, 'DEBUG');
				currentlyMissing.delete(guild.id);
				break;
			}
		}
	}
};