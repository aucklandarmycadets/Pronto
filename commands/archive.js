const Discord = require('discord.js');
const dateFormat = require('dateformat');

const modules = require('../modules');
const { cmdList: { archiveCmd, helpCmd } } = modules;
const { cmdTxt: { archiveDesc } } = modules;
const { helpObj: { errorArchive } } = modules;
const { sendErrorEmbed, debugError, embedScaffold } = modules;
const { constObj: {
	error: errorRed,
	yellow,
	dateOutput,
	archivedID,
	logID,
	cqmsPlus,
	successEmoji,
	errorEmoji,
} } = modules;

module.exports = {
	name: archiveCmd,
	description: archiveDesc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const memberRoles = msg.member.roles.cache;
		const channelMentions = msg.mentions.channels;
		const numChannelMentions = channelMentions.size;
		const channel = channelMentions.first();

		if (!memberRoles.some(roles => cqmsPlus.includes(roles.id))) {
			bot.commands.get(helpCmd).execute(msg, args);
			return;
		}

		if (numChannelMentions === 0) {
			sendErrorEmbed(msg, 'You must specify a text channel.', errorArchive);
		}

		else if (channelMentions.some(mention => mention.type !== 'text')) {
			sendErrorEmbed(msg, 'You can only archive text channels.', errorArchive);
		}

		else if (numChannelMentions > 1) {
			sendErrorEmbed(msg, 'You must archive channels individually.', errorArchive);
		}

		else if (bot.channels.cache.get(channel.id).parentID === archivedID) {
			sendErrorEmbed(msg, 'Channel is already archived.', errorArchive);
		}

		else {
			const logChannel = bot.channels.cache.get(logID);

			channel.setParent(archivedID, { lockPermissions: true })
				.then(() => {
					const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

					msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

					const archiveEmbed = new Discord.MessageEmbed()
						.setTitle('Channel Archived 🔒')
						.setColor(errorRed)
						.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
						.setFooter(`${dateFormat(msg.createdAt, dateOutput)}`);
					channel.send(archiveEmbed);

					const logEmbed = new Discord.MessageEmbed()
						.setColor(yellow)
						.setAuthor(msg.author.tag, msg.author.displayAvatarURL())
						.setDescription(`**Channel ${channel} archived by ${msg.author}**`)
						.setFooter(`User: ${msg.author.id} | Channel: ${channel.id} | ${dateFormat(msg.createdAt, dateOutput)}`);
					logChannel.send(logEmbed);
				})
				.catch(error => {
					const errorEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === errorEmoji);

					msg.react(errorEmojiObj).catch(reactError => debugError(reactError, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

					embedScaffold(msg.channel, `${msg.author} Error archiving ${channel}.`, errorRed, 'msg');
					debugError(error, `Error archiving ${channel}.`);
				});
		}
	},
};