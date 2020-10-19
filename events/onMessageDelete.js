const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { prefix, dateOutput }, ids: { logID }, colours } = require('../config');
const { cmds: { purge } } = require('../cmds');
const { charLimit, sendMsg, debugError } = require('../modules');

module.exports = {
	events: ['messageDelete'],
	process: [],
	async execute(event, msg) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error);

		if (msg.partial) {
			logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL());
			logEmbed.setDescription(`**Uncached message deleted in ${msg.channel}**`);
			logEmbed.setFooter(`ID: ${msg.id} | ${dateFormat(dateOutput)}`);
		}

		else {
			if (msg.content.startsWith(prefix) || !msg.guild) return;

			const messageAuthor = msg.author;
			const lastMessage = msg.channel.lastMessage;

			const fetchedLogs = await msg.guild.fetchAuditLogs({
				limit: 1,
				type: 'MESSAGE_DELETE',
			})
				.catch(error => debugError(error, 'Error fetching audit logs.'));

			const deletionLog = fetchedLogs ? fetchedLogs.entries.first() : null;

			let content = (msg.content === '')
				? msg.embeds[0]
					? msg.embeds[0].description
						? msg.embeds[0].description
						: msg.embeds[0].title
							? msg.embeds[0].title
							: 'Message Embed'
					: null
				: msg.content;

			content = (!content)
				? ''
				: charLimit(`>>> ${content}`, 2048);

			logEmbed.setAuthor(messageAuthor.tag, messageAuthor.displayAvatarURL());
			logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted in ${msg.channel}**\n${content}`);
			logEmbed.setFooter(`Author: ${messageAuthor.id} | Message: ${msg.id} | ${dateFormat(dateOutput)}`);

			if (lastMessage) {
				if (lastMessage.content.includes(purge.cmd) || purge.aliases.some(alias => lastMessage.content.includes(alias))) {
					lastMessage.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', `${content}`));
					logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted by ${lastMessage.author} in ${msg.channel}**\n${content}`);
				}
			}

			if (deletionLog) {
				const { executor, target } = deletionLog;

				if (target.id === messageAuthor.id) {
					logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted by ${executor} in ${msg.channel}**\n${content}`);
				}
			}
		}

		sendMsg(log, logEmbed);
	},
};