const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput, version }, ids: { devID }, colours } = require('../config');
const { cmds: { uptime, help } } = require('../cmds');
const { formatAge, dmCmdError } = require('../modules');

module.exports = {
	name: uptime.cmd,
	description: uptime.desc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const authorID = msg.author.id;

		if (!msg.guild && authorID !== devID) {
			dmCmdError(msg);
			return;
		}

		if (authorID !== devID) {
			bot.commands.get(help.cmd).execute(msg, args);
			return;
		}

		else {
			const uptimeEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setFooter(`${formatAge(bot.uptime)} | ${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);
			msg.channel.send(uptimeEmbed);
		}
	},
};