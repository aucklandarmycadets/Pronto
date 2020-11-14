'use strict';

const Discord = require('discord.js');
const { charLimit, debugError, delMsg, dtg, sendMsg } = require('../modules');

module.exports = {
	events: ['messageDelete'],
	process: [],
	async execute(_, msg) {
		const { bot } = require('../pronto');
		const { config: { prefix }, ids: { logID }, cmds: { evaluate, help, lesson, attendance, assign, purge }, colours } = await require('../handlers/database')(msg.guild);

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error);

		if (msg.partial && msg.guild) {
			logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL());
			logEmbed.setDescription(`**Uncached message deleted in ${msg.channel}**`);
			logEmbed.setFooter(`ID: ${msg.id} | ${await dtg()}`);
		}

		else if (msg.guild) {
			if (cmdCheck()) return;

			const messageAuthor = msg.author;
			const lastMsg = msg.channel.lastMessage;

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

			const attachment = (msg.attachments)
				? msg.attachments.first()
				: null;

			logEmbed.setAuthor(messageAuthor.tag, messageAuthor.displayAvatarURL({ dynamic: true }));
			logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted in ${msg.channel}**\n${content}`);
			logEmbed.setFooter(`Author: ${messageAuthor.id} | Message: ${msg.id} | ${await dtg()}`);

			if (attachment) logEmbed.addField('Attachment', Discord.escapeMarkdown(attachment.name));

			if (lastMsg) {
				if (lastMsg.content.includes(purge.cmd) || purge.aliases.some(alias => lastMsg.content.includes(alias))) {
					delMsg(lastMsg);
					logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted by ${lastMsg.author} in ${msg.channel}**\n${content}`);
				}
			}

			const fetchedLogs = await msg.guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' })
				.catch(error => debugError(error, 'Error fetching audit logs.'));

			const deletionLog = (fetchedLogs)
				? fetchedLogs.entries.first()
				: null;

			if (deletionLog) {
				const { executor, target } = deletionLog;

				if (target.id === messageAuthor.id) {
					logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted by ${executor} in ${msg.channel}**\n${content}`);
				}
			}
		}

		else return;

		sendMsg(log, logEmbed);

		function cmdCheck() {
			const autoDelCmds = [evaluate, help, lesson, attendance, assign, purge];

			const args = msg.content.split(/ +/);
			const msgCmd = args.shift().toLowerCase().replace(prefix, '');

			const hasCmd = cmd => cmd.cmd === msgCmd || cmd.aliases.includes(msgCmd);

			return autoDelCmds.some(hasCmd);
		}
	},
};