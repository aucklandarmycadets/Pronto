const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('../config');
const { config: { dateOutput }, ids: { logID, archivedID } } = config;
const { emojis: { successEmoji, errorEmoji }, colours } = config;
const { cmds: { archive } } = require('../cmds');
const { cmdError, sendMsg, debugError, embedScaffold } = require('../modules');

module.exports = archive;
module.exports.execute = msg => {
	'use strict';

	const { bot } = require('../pronto.js');
	const channelMentions = msg.mentions.channels;
	const numChannelMentions = channelMentions.size;
	const channel = channelMentions.first();

	try {
		if (numChannelMentions === 0) throw 'You must specify a text channel.';

		else if (channelMentions.some(mention => mention.type !== 'text' && mention.type !== 'news')) throw 'You can only archive text channels.';

		else if (numChannelMentions > 1) throw 'You must archive channels individually.';

		else if (bot.channels.cache.get(channel.id).parentID === archivedID) throw 'Channel is already archived.';
	}

	catch (error) { return cmdError(msg, error, archive.error); }

	const log = bot.channels.cache.get(logID);

	channel.setParent(archivedID, { lockPermissions: true })
		.then(() => {
			const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

			msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

			const archiveEmbed = new Discord.MessageEmbed()
				.setTitle('Channel Archived 🔒')
				.setColor(colours.error)
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setFooter(`${dateFormat(dateOutput)}`);
			sendMsg(channel, archiveEmbed);

			const logEmbed = new Discord.MessageEmbed()
				.setColor(colours.warn)
				.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
				.setDescription(`**Channel ${channel} archived by ${msg.author}**`)
				.setFooter(`User: ${msg.author.id} | Channel: ${channel.id} | ${dateFormat(dateOutput)}`);
			sendMsg(log, logEmbed);
		})
		.catch(error => {
			const errorEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === errorEmoji);
			msg.react(errorEmojiObj).catch(reactError => debugError(reactError, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));
			embedScaffold(msg.channel, `${msg.author} Error archiving ${channel}.`, colours.error, 'msg');
			debugError(error, `Error archiving ${channel}.`);
		});
};