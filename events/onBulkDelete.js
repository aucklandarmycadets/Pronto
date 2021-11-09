'use strict';

const Discord = require('discord.js');
const { delMsg, dtg, sendMsg } = require('../modules');

module.exports = {
	events: ['messageDeleteBulk'],
	process: [],
	async execute(_, msgs) {
		const guild = msgs.first().guild;

		const { bot } = require('../pronto');
		const { ids: { logID }, cmds: { purge }, colours } = await require('../handlers/database')(guild);

		const log = bot.channels.cache.get(logID);
		const msg = msgs.first();
		const deleteCount = msgs.array().length;
		const lastMsg = msg.channel.lastMessage;

		const logEmbed = new Discord.MessageEmbed();

		if (!lastMsg) {
			logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }));
			logEmbed.setDescription(`**${deleteCount} messages bulk deleted in ${msg.channel}**`);
		}

		else if (lastMsg.content.includes(purge.cmd) || purge.aliases.some(alias => lastMsg.content.includes(alias))) {
			delMsg(lastMsg);

			logEmbed.setAuthor(lastMsg.author.tag, lastMsg	.author.displayAvatarURL({ dynamic: true }));
			logEmbed.setDescription(`**${deleteCount} messages bulk deleted by ${lastMsg.author} in ${msg.channel}**`);
		}

		logEmbed.setColor(colours.error);
		logEmbed.setFooter(await dtg());
		sendMsg(log, { embeds: [logEmbed] });
	},
};