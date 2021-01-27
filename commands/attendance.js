'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');
const Attendance = require('../models/attendance');

const confirmation = require('../handlers/confirmation');
const { cmdError, delMsg, dtg, emojiReact, sendDM, sendMsg } = require('../modules');

module.exports = async guild => {
	const { ids: { attendanceID, formations }, cmds: { attendance }, colours } = await require('../handlers/database')(guild);

	attendance.execute = async (msg, args) => {
		const { bot } = require('../pronto');

		const memberRoles = msg.member.roles.cache;

		try {
			if (args.length === 0) throw '';

			if (args[0].toLowerCase() === 'update' && args.length === 1) throw '';
		}

		catch (error) {
			return cmdError(msg, 'You cannot submit an empty register.', attendance.error);
		}

		delMsg(msg);

		let formationColour = colours.default;
		let formationName = msg.guild.name;

		for (const role of Object.values(memberRoles.array())) {
			if (formations.includes(role.id)) {
				formationColour = role.color;
				formationName = role.name;
			}
		}

		if (args[0].toLowerCase() === 'update') return cmdError(msg, 'Please use the 📝 reaction to edit a register.', attendance.error);

		else createRegister();

		function createRegister() {
			const content = args.join(' ').split('\n');
			const title = content.shift();
			const register = content.join('\n');

			const attendanceEmbed = new Discord.MessageEmbed()
				.setColor(formationColour)
				.setAuthor(formationName, msg.guild.iconURL())
				.setTitle(title)
				.setDescription(register)
				.setFooter('Use the reactions below to confirm or cancel.');

			sendDM(msg.author, attendanceEmbed, msg.channel)
				.then(dm => {
					const sendAttendance = async () => {
						attendanceEmbed.setAuthor(`${formationName} (${msg.member.displayName})`, msg.guild.iconURL());
						attendanceEmbed.setFooter(await dtg());


						// / embedScaffold(guild, msg.channel, `${msg.author} Successfully updated attendance for **[${title}](${chnlMsg.url})**.`, colours.success, 'msg');

						const attendanceChannel = bot.channels.cache.get(attendanceID);

						const attendanceMessage = await sendMsg(attendanceChannel, attendanceEmbed);
						const channelMessage = await sendMsg(msg.channel, attendanceEmbed);

						const db = await new Attendance({
							_id: mongoose.Types.ObjectId(),
							channelID: channelMessage.id,
							attendanceID: attendanceMessage.id,
							name: title,
							formation: formationName,
							author: [msg.author.id],
						});

						db.save();

						await emojiReact(channelMessage, '📝');
						await emojiReact(channelMessage, '🗑️');

					};

					confirmation(msg, dm, sendAttendance);
				});
		}
	};

	return attendance;
};