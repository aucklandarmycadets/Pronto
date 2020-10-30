'use strict';

const { ids: { devID } } = require('../config');
const { getRoleError } = require('../modules');

module.exports = async (msg, cmd) => {
	const { bot } = require('../pronto');
	const { ids: { serverID } } = await require('../handlers/database')(msg.guild);

	const server = bot.guilds.cache.get(serverID);

	const memberRoles = (msg.guild)
		? msg.member.roles.cache
		: await server.members.fetch(msg.author.id).then(member => member.roles.cache);

	if (!memberRoles) return await getRoleError(msg);

	if (((cmd.noRoles.length && !memberRoles.some(roles => cmd.noRoles.includes(roles.id)))
		&& (cmd.roles.length && memberRoles.some(roles => cmd.roles.includes(roles.id))))
		|| (cmd.devOnly && msg.author.id === devID)) {
		return true;
	}

	return false;
};