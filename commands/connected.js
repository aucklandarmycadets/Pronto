'use strict';

const Discord = require('discord.js');
const { cmdError, dtg, sendMsg, sortByRoles, successReact } = require('../modules');

module.exports = async guild => {
	const { ids: { attendanceID }, cmds: { connected }, colours } = await require('../handlers/database')(guild);

	connected.execute = async msg => {
		const { bot } = require('../pronto');

		const channelMentions = msg.mentions.channels;
		const numChannelMentions = channelMentions.size;
		const channel = channelMentions.first();

		try {
			if (numChannelMentions === 0) throw 'You must specify a voice channel.';

			else if (channelMentions.some(mention => mention.type !== 'voice')) throw 'Input must be a voice channel.';

			else if (numChannelMentions > 1) throw 'You can only display one channel at a time.';
		}

		catch (error) { return cmdError(msg, error, connected.error, 'Note: Use the <#channelID> syntax!'); }

		const connectedMembers = channel.members.sort(sortByRoles(guild)).map(member => member.toString());

		if (connectedMembers.length === 0) return cmdError(msg, `There are no members connected to ${channel}.`, connected.error, 'Note: Use the <#channelID> syntax!');

		successReact(msg);

		const connectedEmbed = new Discord.MessageEmbed()
			.setTitle(`Members Connected to #${channel.name}`)
			.setColor(colours.success)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setDescription(connectedMembers.join('\n'))
			.setFooter(await dtg());
		sendMsg(attendanceChannel, { embeds: [connectedEmbed] });
	};

	return connected;
};