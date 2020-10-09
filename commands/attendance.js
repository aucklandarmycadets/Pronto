const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput }, ids: { attendanceID, formations }, colours } = require('../config');
const { cmds: { attendance } } = require('../cmds');
const { cmdError, debugError } = require('../modules');

module.exports = {
	name: attendance.cmd,
	description: attendance.desc,
	allowDM: attendance.allowDM,
	roles: attendance.roles,
	noRoles: attendance.noRoles,
	devOnly: attendance.devOnly,
	help: attendance.help,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const memberRoles = msg.member.roles.cache;

		if (args.length === 0) {
			cmdError(msg, 'You must enter a message.', attendance.error);
		}

		else {
			const attendanceChannel = bot.channels.cache.get(attendanceID);

			msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

			let formationColour = colours.default;
			let formationName = msg.guild.name;

			for (const role of Object.values(memberRoles.array())) {
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