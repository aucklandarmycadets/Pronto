'use strict';

const { ids: { serverID, devID } } = require('../config');
const { getRoleError } = require('../modules');

module.exports = (msg, cmd) => {
	const { bot } = require('../pronto');

	const server = bot.guilds.cache.get(serverID);
	const authorID = msg.author.id;

	const memberRoles = (msg.guild)
		? msg.member.roles.cache
		: server.members.cache.get(authorID).roles.cache;

	if (!memberRoles) return getRoleError(msg);

	if ((cmd.noRoles.length && !memberRoles.some(roles => cmd.noRoles.includes(roles.id)))
		|| (cmd.roles.length && memberRoles.some(roles => cmd.roles.includes(roles.id)))
		|| (cmd.devOnly && authorID === devID)) {
		return true;
	}

	return false;
};