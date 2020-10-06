const Discord = require('discord.js');
const dateFormat = require('dateformat');

const modules = require('../modules');
const { cmdList: { uptimeCmd, helpCmd } } = modules;
const { cmdTxt: { uptimeDesc } } = modules;
const { dmCmdError, formatAge } = modules;
const { constObj: { version, success: successGreen, devID, dateOutput } } = modules;

module.exports = {
	name: uptimeCmd,
	description: uptimeDesc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const authorID = msg.author.id;

		if (!msg.guild && authorID !== devID) {
			dmCmdError(msg, true);
			return;
		}

		if (authorID !== devID) {
			bot.commands.get(helpCmd).execute(msg, args);
			return;
		}

		else {
			const uptimeEmbed = new Discord.MessageEmbed()
				.setColor(successGreen)
				.setFooter(`${formatAge(bot.uptime)} | ${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);
			msg.channel.send(uptimeEmbed);
		}
	},
};