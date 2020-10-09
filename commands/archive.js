const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('../config');
const { config: { dateOutput }, ids: { logID, archivedID } } = config;
const { emojis: { successEmoji, errorEmoji }, colours } = config;
const { cmds: { archive } } = require('../cmds');
const { cmdError, sendMsg, debugError, embedScaffold } = require('../modules');

module.exports = {
	cmd: archive.cmd,
	aliases: archive.aliases,
	description: archive.desc,
	allowDM: archive.allowDM,
	roles: archive.roles,
	noRoles: archive.noRoles,
	devOnly: archive.devOnly,
	help: archive.help,
	execute(msg) {
		'use strict';

		const { bot } = require('../pronto.js');
		const channelMentions = msg.mentions.channels;
		const numChannelMentions = channelMentions.size;
		const channel = channelMentions.first();

		if (numChannelMentions === 0) {
			cmdError(msg, 'You must specify a text channel.', archive.error);
		}

		else if (channelMentions.some(mention => mention.type !== 'text')) {
			cmdError(msg, 'You can only archive text channels.', archive.error);
		}

		else if (numChannelMentions > 1) {
			cmdError(msg, 'You must archive channels individually.', archive.error);
		}

		else if (bot.channels.cache.get(channel.id).parentID === archivedID) {
			cmdError(msg, 'Channel is already archived.', archive.error);
		}

		else {
			const log = bot.channels.cache.get(logID);

			channel.setParent(archivedID, { lockPermissions: true })
				.then(() => {
					const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

					msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

					const archiveEmbed = new Discord.MessageEmbed()
						.setTitle('Channel Archived 🔒')
						.setColor(colours.error)
						.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
						.setFooter(`${dateFormat(msg.createdAt, dateOutput)}`);
					sendMsg(channel, archiveEmbed);

					const logEmbed = new Discord.MessageEmbed()
						.setColor(colours.warn)
						.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
						.setDescription(`**Channel ${channel} archived by ${msg.author}**`)
						.setFooter(`User: ${msg.author.id} | Channel: ${channel.id} | ${dateFormat(msg.createdAt, dateOutput)}`);
					sendMsg(log, logEmbed);
				})
				.catch(error => {
					const errorEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === errorEmoji);
					msg.react(errorEmojiObj).catch(reactError => debugError(reactError, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));
					embedScaffold(msg.channel, `${msg.author} Error archiving ${channel}.`, colours.error, 'msg');
					debugError(error, `Error archiving ${channel}.`);
				});
		}
	},
};