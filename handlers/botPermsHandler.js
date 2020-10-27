'use strict';

const Discord = require('discord.js');
const { config: { permsInt } } = require('../config');
const { embedScaffold } = require('../modules');

module.exports = async (guild, changes) => {
	const { bot } = require('../pronto');
	const { ids: { serverID }, colours } = await require('./database')(guild);

	const requiredPermissions = new Discord.Permissions(permsInt);
	const server = bot.guilds.cache.get(serverID);
	const botPermissions = server.me.permissions;
	const hasRequired = botPermissions.has(requiredPermissions);

	const missingPermissions = [...new Set([...requiredPermissions].filter(value => !botPermissions.has(value)))];

	if (!hasRequired) embedScaffold(null, 'I do not have my minimum permissions!', colours.error, 'debug', 'Missing Permissions', missingPermissions);

	else if (changes) {
		const requiredArray = requiredPermissions.toArray();

		for (let i = 0; i < changes.length; i++) {
			if (requiredArray.includes(changes[i])) {
				embedScaffold(null, 'Permissions resolved.', colours.success, 'debug');
				break;
			}
		}
	}
};