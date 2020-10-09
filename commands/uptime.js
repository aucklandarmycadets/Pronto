const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput }, colours } = require('../config');
const { cmds: { uptime } } = require('../cmds');
const { formatAge, sendMsg } = require('../modules');

module.exports = {
	cmd: uptime.cmd,
	aliases: uptime.aliases,
	description: uptime.desc,
	allowDM: uptime.allowDM,
	roles: uptime.roles,
	noRoles: uptime.noRoles,
	devOnly: uptime.devOnly,
	help: uptime.help,
	execute(msg) {
		'use strict';

		const { bot, version } = require('../pronto.js');

		const uptimeEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setFooter(`${formatAge(bot.uptime)} | ${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);

		sendMsg(msg.channel, uptimeEmbed);
	},
};