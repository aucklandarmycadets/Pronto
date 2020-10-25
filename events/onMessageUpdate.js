const Discord = require('discord.js');

const { config: { prefix }, ids: { logID }, colours } = require('../config');
const { charLimit, dtg, sendMsg } = require('../modules');

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

			const msgAuthor = newMessage.author;

			logEmbed.setAuthor(msgAuthor.tag, msgAuthor.displayAvatarURL());
			logEmbed.setDescription(`**Uncached message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`ID: ${newMessage.id} | ${dtg()}`);
		}

		else {
			if (oldMessage.content === newMessage.content || newMessage.author.bot || !newMessage.guild) return;

			const msgAuthor = newMessage.author;

			logEmbed.setAuthor(msgAuthor.tag, msgAuthor.displayAvatarURL());
			logEmbed.setDescription(`**Message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('Before', charLimit(oldMessage.content, 1024));
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`Author: ${msgAuthor.id} | Message: ${newMessage.id} | ${dtg()}`);
		}

		if (newMessage.content.startsWith(prefix)) bot.emit('message', newMessage);

		sendMsg(log, logEmbed);
	},
};