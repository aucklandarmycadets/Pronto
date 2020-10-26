'use strict';

const Discord = require('discord.js');

const { ids: { logID }, colours } = require('../config');
const { cmds: { purge } } = require('../cmds');
const { dtg, sendMsg, delMsg } = require('../modules');

module.exports = {
	events: ['messageDeleteBulk'],
	process: [],
	execute(event, msgs) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
		const msg = msgs.first();
		const deleteCount = msgs.array().length;
		const lastMsg = msg.channel.lastMessage;

		const logEmbed = new Discord.MessageEmbed();

		if (!lastMsg) {
			logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL());
			logEmbed.setDescription(`**${deleteCount} messages bulk deleted in ${msg.channel}**`);
		}

		else if (lastMsg.content.includes(purge.cmd) || purge.aliases.some(alias => lastMsg.content.includes(alias))) {
			delMsg(lastMsg);

			logEmbed.setAuthor(lastMsg.author.tag, lastMsg	.author.displayAvatarURL());
			logEmbed.setDescription(`**${deleteCount} messages bulk deleted by ${lastMsg.author} in ${msg.channel}**`);
		}

		logEmbed.setColor(colours.error);
		logEmbed.setFooter(`${dtg()}`);
		sendMsg(log, logEmbed);
	},
};