'use strict';

const Discord = require('discord.js');
const { capitalise, cmdError, dtg, sendDM, sendMsg, successReact } = require('../modules');

module.exports = async guild => {
	const { ids: { attendanceID }, cmds: { leave, leaveFor }, colours } = await require('../handlers/database')(guild);

	leave.execute = async (msg, args) => {
		const { bot } = require('../pronto');

		if (args.length === 0) return cmdError(msg, 'Insufficient arguments.', leave.error);
		if (args[0].toLowerCase() === 'for') return bot.commands.get(leaveFor.cmd).execute(msg, args.slice(1));

		const leaveEmbedTitle = 'Leave Request';
		const attendanceChannel = bot.channels.cache.get(attendanceID);

		successReact(msg);

		const attendanceEmbed = new Discord.MessageEmbed()
			.setTitle(leaveEmbedTitle)
			.setColor(colours.leave)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setDescription(`**${msg.member.displayName}** has requested leave in **#${msg.channel.name}**`)
			.addField('Channel', msg.channel.toString())
			.addField('Remarks', capitalise(args.join(' ')))
			.setFooter(await dtg());

		const dmEmbed = new Discord.MessageEmbed()
			.setTitle(leaveEmbedTitle)
			.setColor(colours.leave)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setDescription(`Hi **${msg.member.displayName}**, your submission of leave has been received.`)
			.addField('Channel', msg.channel.toString())
			.addField('Remarks', capitalise(args.join(' ')))
			.setFooter(await dtg());

		sendMsg(attendanceChannel, { embeds: [attendanceEmbed] });
		sendDM(msg.author, { embeds: [dmEmbed] }, msg.channel);
	};

	return leave;
};