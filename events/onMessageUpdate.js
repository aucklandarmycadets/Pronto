const Discord = require('discord.js');

const { ids: { logID }, colours } = require('../config');
const { charLimit, dtg, sendMsg } = require('../modules');

module.exports = {
	events: ['messageUpdate'],
	process: [],
	execute(event, oldMessage, newMessage) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.warn);

		if (oldMessage.partial) {
			logEmbed.setAuthor(newMessage.guild.name, newMessage.guild.iconURL());
			logEmbed.setDescription(`**Uncached message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`ID: ${newMessage.id} | ${dtg()}`);
		}

		else {
			if (oldMessage.content === newMessage.content || newMessage.author.bot || !newMessage.guild) return;

			const messageAuthor = newMessage.author;

			logEmbed.setAuthor(messageAuthor.tag, messageAuthor.displayAvatarURL());
			logEmbed.setDescription(`**Message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('Before', charLimit(oldMessage.content, 1024));
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`Author: ${messageAuthor.id} | Message: ${newMessage.id} | ${dtg()}`);
		}

		sendMsg(log, logEmbed);
	},
};