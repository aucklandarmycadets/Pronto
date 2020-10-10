const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('../config');
const { config: { dateOutput }, ids: { attendanceID } } = config;
const { emojis: { successEmoji }, colours } = config;
const { cmds: { connected } } = require('../cmds');
const { cmdError, sendMsg, debugError } = require('../modules');

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

		try {
			if (numChannelMentions === 0) throw 'You must specify a voice channel.';

			else if (channelMentions.some(mention => mention.type !== 'voice')) throw 'Input must be a voice channel';

			else if (numChannelMentions > 1) throw 'You can only display one channel at a time';
		}

		catch(error) { return cmdError(msg, error, connected.error, 'Note: Use the <#channelID> syntax!'); }

		const connectedMembers = [];
		const attendanceChannel = bot.channels.cache.get(attendanceID);
		const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

		for (const member of Object.values(channel.members.array())) {
			connectedMembers.push(member.toString());
		}

		if (connectedMembers.length === 0) return cmdError(msg, `There are no members connected to ${channel}.`, connected.error, 'Note: Use the <#channelID> syntax!');

		msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

		const connectedEmbed = new Discord.MessageEmbed()
			.setTitle(`Members Connected to #${channel.name}`)
			.setColor(colours.success)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
			.setDescription(connectedMembers.join('\n'))
			.setFooter(`${dateFormat(msg.createdAt, dateOutput)}`);
		sendMsg(attendanceChannel, connectedEmbed);
	},
};