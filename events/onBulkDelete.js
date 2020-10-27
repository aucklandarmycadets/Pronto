'use strict';

const Discord = require('discord.js');
const { delMsg, dtg, sendMsg } = require('../modules');

module.exports = {
	events: ['messageDeleteBulk'],
	process: [],
	async execute(event, msgs) {
		const guild = msgs.first().guild;

		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(guild);
		const { cmds: { purge } } = await require('../cmds')(guild);

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