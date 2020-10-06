const Discord = require('discord.js');
const dateFormat = require('dateformat');

const modules = require('../modules');
const { cmdList: { attendanceCmd, helpCmd } } = modules;
const { cmdTxt: { attendanceDesc } } = modules;
const { helpObj: { errorAttendance } } = modules;
const { sendErrorEmbed, debugError } = modules;
const { constObj: {
	grey,
	dateOutput,
	attendanceID,
	tacPlus,
	formations,
} } = modules;

module.exports = {
	name: attendanceCmd,
	description: attendanceDesc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const memberRoles = msg.member.roles.cache;

		if (!memberRoles.some(roles => tacPlus.includes(roles.id))) {
			bot.commands.get(helpCmd).execute(msg, args);
			return;
		}

		if (args.length === 0) {
			sendErrorEmbed(msg, 'You must enter a message.', errorAttendance);
		}

		else {
			const attendanceChannel = bot.channels.cache.get(attendanceID);

			msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

			let formationColour = grey;
			let formationName = msg.guild.name;

			for (const [, role] of Object.entries(memberRoles.array())) {
				if (formations.includes(role.id)) {
					formationColour = role.color;
					formationName = role.name;
				}
			}

			const attendanceEmbed = new Discord.MessageEmbed()
				.setColor(formationColour)
				.setAuthor(`${formationName} (${msg.member.displayName})`, msg.guild.iconURL())
				.setDescription(`${args.join(' ')}`)
				.setFooter(`${dateFormat(msg.createdAt, dateOutput)}`);

			attendanceChannel.send(attendanceEmbed);
			msg.channel.send(attendanceEmbed);
		}
	},
};