const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('../config');
const { config: { dateOutput }, ids: { attendanceID } } = config;
const { emojis: { successEmoji }, colours } = config;
const { cmds: { connected } } = require('../cmds');
const { cmdError, debugError } = require('../modules');

module.exports = {
	cmd: connected.cmd,
	aliases: connected.aliases,
	description: connected.desc,
	allowDM: connected.allowDM,
	roles: connected.roles,
	noRoles: connected.noRoles,
	devOnly: connected.devOnly,
	help: connected.help,
	execute(msg) {
		'use strict';

		const { bot } = require('../pronto.js');
		const channelMentions = msg.mentions.channels;
		const numChannelMentions = channelMentions.size;
		const channel = channelMentions.first();

		if (numChannelMentions === 0) {
			cmdError(msg, 'You must specify a voice channel.', connected.error, 'Note: Use the <#channelID> syntax!');
		}

		else if (channelMentions.some(mention => mention.type !== 'voice')) {
			cmdError(msg, 'Input must be a voice channel.', connected.error, 'Note: Use the <#channelID> syntax!');
		}

		else if (numChannelMentions > 1) {
			cmdError(msg, 'You can only display one channel at a time.', connected.error, 'Note: Use the <#channelID> syntax!');
		}

		else {
			const connectedMembers = [];
			const attendanceChannel = bot.channels.cache.get(attendanceID);
			const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

			for (const member of Object.values(channel.members.array())) {
				connectedMembers.push(member.toString());
			}

			if (connectedMembers.length === 0) {
				return cmdError(msg, `There are no members connected to ${channel}.`, connected.error);
			}

			msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

			const connectedEmbed = new Discord.MessageEmbed()
				.setTitle(`Members Connected to #${channel.name}`)
				.setColor(colours.success)
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setDescription(connectedMembers.join('\n'))
				.setFooter(`${dateFormat(msg.createdAt, dateOutput)}`);
			attendanceChannel.send(connectedEmbed);
		}
	},
};