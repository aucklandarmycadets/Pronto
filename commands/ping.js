const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput, version }, ids: { devID }, colours } = require('../config');
const { cmds: { ping, help } } = require('../cmds');
const { dmCmdError } = require('../modules');

module.exports = {
	name: ping.cmd,
	description: ping.desc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const authorID = msg.author.id;

		if (!msg.guild && authorID !== devID) {
			dmCmdError(msg, 'noPerms');
			return;
		}

		if (authorID !== devID) {
			bot.commands.get(help.cmd).execute(msg, args);
			return;
		}

		else {
			let pingValue = 'Pinging...';

			msg.channel.send('**Pong!**').then(reply => {
				pingValue = reply.createdTimestamp - msg.createdTimestamp;
				const pingEmbed = new Discord.MessageEmbed()
					.setColor(colours.success)
					.setFooter(`${pingValue} ms | ${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);
				reply.edit(pingEmbed);
			});
		}
	},
};