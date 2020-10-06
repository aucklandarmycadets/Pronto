const Discord = require('discord.js');
const dateFormat = require('dateformat');

const modules = require('../modules');
const { cmdList: { connectedCmd, helpCmd } } = modules;
const { cmdTxt: { connectedDesc } } = modules;
const { helpObj: { errorConnected } } = modules;
const { sendErrorEmbed, debugError } = modules;
const { constObj: {
	success: successGreen,
	dateOutput,
	attendanceID,
	sgtPlus,
	successEmoji,
} } = modules;

module.exports = {
	name: connectedCmd,
	description: connectedDesc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const memberRoles = msg.member.roles.cache;
		const channelMentions = msg.mentions.channels;
		const numChannelMentions = channelMentions.size;
		const channel = channelMentions.first();

		if (!memberRoles.some(roles => sgtPlus.includes(roles.id))) {
			bot.commands.get(helpCmd).execute(msg, args);
			return;
		}

		if (numChannelMentions === 0) {
			sendErrorEmbed(msg, 'You must specify a voice channel.', errorConnected, 'Note: Use the <#channelID> syntax!');
		}

		else if (channelMentions.some(mention => mention.type !== 'voice')) {
			sendErrorEmbed(msg, 'Input must be a voice channel.', errorConnected, 'Note: Use the <#channelID> syntax!');
		}

		else if (numChannelMentions > 1) {
			sendErrorEmbed(msg, 'You can only display one channel at a time.', errorConnected, 'Note: Use the <#channelID> syntax!');
		}

		else {
			const connectedMembers = [];
			const attendanceChannel = bot.channels.cache.get(attendanceID);
			const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

			for (const [, member] of Object.entries(channel.members.array())) {
				connectedMembers.push(member.toString());
			}

			if (connectedMembers.length === 0) {
				sendErrorEmbed(msg, `There are no members connected to ${channel}.`, errorConnected);
				return;
			}

			msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

			const connectedEmbed = new Discord.MessageEmbed()
				.setTitle(`Members Connected to #${channel.name}`)
				.setColor(successGreen)
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setDescription(connectedMembers.join('\n'))
				.setFooter(`${dateFormat(msg.createdAt, dateOutput)}`);
			attendanceChannel.send(connectedEmbed);
		}
	},
};