'use strict';

const { getRoleError } = require('../modules');

module.exports = async (msg, cmd) => {
	const { bot } = require('../pronto');
	const { permissionsCheck } = require('./');
	const { ids: { serverID } } = await require('../handlers/database')(msg.guild);

	const server = bot.guilds.cache.get(serverID);

	const member = (msg.guild)
		? msg.member
		: await server.members.fetch(msg.author.id);

	if (!member) return 'err';

	const memberRoles = member.roles.cache;

	return (memberRoles)
		? permissionsCheck(memberRoles, msg.author.id, cmd)
		: await getRoleError(msg);
};