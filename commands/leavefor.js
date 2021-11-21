'use strict';

const Discord = require('discord.js');
const { capitalise, cmdError, dtg, pCmd, remove, sendDM, sendMsg, successReact } = require('../modules');

module.exports = async guild => {
	const { ids: { attendanceID }, cmds: { help, leave, leaveFor }, colours } = await require('../handlers/database')(guild);

	leaveFor.execute = async (msg, args) => {
		const { bot } = require('../pronto');

		const memberMentions = msg.mentions.members;
		const numMemberMentions = memberMentions.size;
		const absentee = memberMentions.first();

		try {
			if (numMemberMentions === 0) throw 'You must tag a user.';

			else if (memberMentions.some(mention => mention.user.bot)) throw 'You cannot submit leave for a bot!';

			else if (numMemberMentions > 1) throw 'You must submit leave individually.';

			else if (args.length < 2) throw 'Insufficient arguments.';
		}

		catch (error) { return cmdError(msg, error, leaveFor.error); }

		const leaveForEmbedTitle = 'Leave Request (For)';
		const attendanceChannel = bot.channels.cache.get(attendanceID);

		successReact(msg);

		args = remove(args, `<@!${absentee.user.id}>`);

		const attendanceEmbed = new Discord.MessageEmbed()
			.setTitle(leaveForEmbedTitle)
			.setColor(colours.leave)
			.setAuthor(absentee.displayName, absentee.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`**${msg.member.displayName}** has submitted leave for **${absentee.displayName}** in **#${msg.channel.name}**`)
			.addFields(
				{ name: 'Absentee', value: absentee.toString() },
				{ name: 'Channel', value: msg.channel.toString() },
				{ name: 'Remarks', value: capitalise(args.join(' ')) },
			)
			.setFooter(await dtg());

		const dmEmbed = new Discord.MessageEmbed()
			.setTitle(leaveForEmbedTitle)
			.setColor(colours.leave)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setDescription(`Hi **${msg.member.displayName}**, your submission of leave for **${absentee.displayName}** has been received.`)
			.addField('Channel', msg.channel.toString())
			.addField('Remarks', capitalise(args.join(' ')))
			.setFooter(await dtg());

		const absenteeEmbed = new Discord.MessageEmbed()
			.setTitle(leaveForEmbedTitle)
			.setColor(colours.leave)
			.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }))
			.setDescription(`**${msg.member.displayName}** has submitted leave for you in **#${msg.channel.name}**.`)
			.addField('Channel', msg.channel.toString())
			.addField('Remarks', capitalise(args.join(' ')))
			.setFooter(`Reply with '${await pCmd(help)} ${leave.cmd}' to learn how to request leave for yourself.`);

		sendMsg(attendanceChannel, { embeds: [attendanceEmbed] });
		sendDM(msg.author, { embeds: [dmEmbed] }, msg.channel);
		sendDM(absentee, { embeds: [absenteeEmbed] }, msg.channel, true);
	};

	return leaveFor;
};