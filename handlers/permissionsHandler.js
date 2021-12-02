'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { getRoleError } = require('../modules');

/**
 *
 * @param {Discord.Message} msg
 * @param {Object.<string, string | string[] | boolean>} cmd The command object to check permissions against
 * @returns
 */
module.exports = async (msg, cmd) => {
	const { bot } = require('../pronto');
	const { permissionsCheck } = require('./');

	const server = bot.guilds.cache.find(guild => guild.members.cache.has(msg.author.id));

	const member = (msg.guild)
		? msg.member
		: await server.members.fetch(msg.author.id);

	const memberRoles = member.roles.cache;

	return (memberRoles)
		? permissionsCheck(memberRoles, msg.author.id, cmd)
		: await getRoleError(msg);
};