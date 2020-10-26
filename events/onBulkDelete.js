'use strict';

const Discord = require('discord.js');

const { ids: { logID }, colours } = require('../config');
const { cmds: { purge } } = require('../cmds');
const { dtg, sendMsg, debugError } = require('../modules');

module.exports = {
	events: ['messageDeleteBulk'],
	process: [],
	execute(event, msgs) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
		const msg = msgs.first();
		const deleteCount = msgs.array().length;
		const lastMessage = msg.channel.lastMessage;

		const logEmbed = new Discord.MessageEmbed();

		if (!lastMessage) {
			logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL());
			logEmbed.setDescription(`**${deleteCount} messages bulk deleted in ${msg.channel}**`);
		}

		else if (lastMessage.content.includes(purge.cmd) || purge.aliases.some(alias => lastMessage.content.includes(alias))) {
			lastMessage.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', lastMessage.content));

			logEmbed.setAuthor(lastMessage.author.tag, lastMessage	.author.displayAvatarURL());
			logEmbed.setDescription(`**${deleteCount} messages bulk deleted by ${lastMessage.author} in ${msg.channel}**`);
		}

		logEmbed.setColor(colours.error);
		logEmbed.setFooter(`${dtg()}`);
		sendMsg(log, logEmbed);
	},
};