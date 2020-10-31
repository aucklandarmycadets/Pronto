'use strict';

const { ids: { devID } } = require('../config');
const { getRoleError } = require('../modules');

module.exports = async (msg, cmd) => {
	const { bot } = require('../pronto');
	const { permissionsCheck } = require('./');
	const { ids: { serverID } } = await require('../handlers/database')(msg.guild);

	const server = bot.guilds.cache.get(serverID);

	const memberRoles = (msg.guild)
		? msg.member.roles.cache
		: await server.members.fetch(msg.author.id).then(member => member.roles.cache);

	if (!memberRoles) return await getRoleError(msg);

	return permissionsCheck(memberRoles, msg.author.id, cmd);
};