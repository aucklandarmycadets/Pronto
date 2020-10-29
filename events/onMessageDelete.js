'use strict';

const Discord = require('discord.js');
const { charLimit, debugError, delMsg, dtg, sendMsg } = require('../modules');

module.exports = {
	events: ['messageDelete'],
	process: [],
	async execute(event, msg) {
		const { bot } = require('../pronto');
		const { config: { prefix }, ids: { logID }, colours } = await require('../handlers/database')(msg.guild);
		const { cmds: { help, attendance, purge } } = await require('../cmds')(msg.guild);

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error);

		if (msg.partial) {
			logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL());
			logEmbed.setDescription(`**Uncached message deleted in ${msg.channel}**`);
			logEmbed.setFooter(`ID: ${msg.id} | ${await dtg()}`);
		}

		else {
			if (cmdCheck() || !msg.guild) return;

			const messageAuthor = msg.author;
			const lastMsg = msg.channel.lastMessage;

			const fetchedLogs = await msg.guild.fetchAuditLogs({
				limit: 1,
				type: 'MESSAGE_DELETE',
			})
				.catch(error => debugError(error, 'Error fetching audit logs.'));

			const deletionLog = (fetchedLogs)
				? fetchedLogs.entries.first()
				: null;

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
			logEmbed.setFooter(`Author: ${messageAuthor.id} | Message: ${msg.id} | ${await dtg()}`);

			if (lastMsg) {
				if (lastMsg.content.includes(purge.cmd) || purge.aliases.some(alias => lastMsg.content.includes(alias))) {
					delMsg(lastMsg);
					logEmbed.setDescription(`**Message sent by ${messageAuthor} deleted by ${lastMsg.author} in ${msg.channel}**\n${content}`);
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

		function cmdCheck() {
			const autoDelCmds = [attendance, help, purge];

			const args = msg.content.split(/ +/);
			const msgCmd = args.shift().toLowerCase().replace(prefix, '');

			if (autoDelCmds.some(cmd => cmd.cmd === msgCmd || cmd.aliases.includes(msgCmd))) return true;

			return false;
		}
	},
};