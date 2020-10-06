const Discord = require('discord.js');
const dateFormat = require('dateformat');

const modules = require('../modules');
const { cmdList: { pingCmd, helpCmd } } = modules;
const { cmdTxt: { pingDesc } } = modules;
const { dmCmdError } = modules;
const { constObj: { version, success: successGreen, devID, dateOutput } } = modules;

module.exports = {
	name: pingCmd,
	description: pingDesc,
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
			let ping = 'Pinging...';

			msg.channel.send('**Pong!**').then(reply => {
				ping = reply.createdTimestamp - msg.createdTimestamp;
				const pingEmbed = new Discord.MessageEmbed()
					.setColor(successGreen)
					.setFooter(`${ping} ms | ${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);
				reply.edit(pingEmbed);
			});
		}
	},
};