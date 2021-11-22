'use strict';

const Discord = require('discord.js');
const { charLimit, dtg, sendMsg } = require('../modules');
const { commandHandler } = require('../handlers');

module.exports = {
	bot: ['messageUpdate'],
	process: [],
	async handler(_, oldMessage, newMessage) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(newMessage.guild);

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.warn);

		newMessage = await newMessage.fetch();

		commandHandler(newMessage);

		if (oldMessage.partial && oldMessage.guild) {
			logEmbed.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL({ dynamic: true }));
			logEmbed.setDescription(`**Uncached message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`ID: ${newMessage.id} | ${await dtg()}`);
		}

		else if (newMessage.guild) {
			if (oldMessage.content === newMessage.content || newMessage.author.bot) return;

			logEmbed.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL({ dynamic: true }));
			logEmbed.setDescription(`**Message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('Before', charLimit(oldMessage.content, 1024));
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`Author: ${newMessage.author.id} | Message: ${newMessage.id} | ${await dtg()}`);
		}

		else return;

		sendMsg(log, { embeds: [logEmbed] });
	},
};