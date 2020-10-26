'use strict';

const Discord = require('discord.js');

const { ids: { logID }, colours } = require('../config');
const { charLimit, dtg, sendMsg } = require('../modules');
const { commandHandler } = require('../handlers');

module.exports = {
	events: ['messageUpdate'],
	process: [],
	async execute(event, oldMessage, newMessage) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.warn);

		if (oldMessage.partial) {
			newMessage = await newMessage.fetch();

			logEmbed.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL());
			logEmbed.setDescription(`**Uncached message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`ID: ${newMessage.id} | ${dtg()}`);
		}

		else {
			if (oldMessage.content === newMessage.content || newMessage.author.bot || !newMessage.guild) return;

			logEmbed.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL());
			logEmbed.setDescription(`**Message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('Before', charLimit(oldMessage.content, 1024));
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`Author: ${newMessage.author.id} | Message: ${newMessage.id} | ${dtg()}`);
		}

		commandHandler(newMessage);
		sendMsg(log, logEmbed);
	},
};