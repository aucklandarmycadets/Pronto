'use strict';

const Discord = require('discord.js');
const confirmation = require('../handlers/confirmation');
const { cmdError, debugError, delMsg, dtg, embedScaffold, sendDM, sendMsg } = require('../modules');

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
			return cmdError(msg, 'You must enter a message.', attendance.error);
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

		if (args[0].toLowerCase() === 'update') {
			args.splice(0, 1);

			if (args.length === 0) return cmdError(msg, 'You must enter a message.', attendance.error);

			const filterBy = message => {
				try { return message.embeds[0].author.name.includes(formationName); }
				catch { null; }
			};

			const attendanceChannel = bot.channels.cache.get(attendanceID);
			let chnlMsg, attMsg;

			await msg.channel.messages.fetch()
				.then(messages => {
					chnlMsg = messages.filter(filterBy).first();
				})
				.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));

			await attendanceChannel.messages.fetch()
				.then(messages => {
					attMsg = messages.filter(filterBy).first();
				})
				.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));

			createRegister(chnlMsg, attMsg);
		}

		else createRegister();

		function createRegister(chnlMsg, attMsg) {
			const content = args.join(' ').split('\n');
			const title = content.shift();
			const register = content.join('\n');

			const attendanceEmbed = new Discord.MessageEmbed()
				.setColor(formationColour)
				.setAuthor(formationName, msg.guild.iconURL())
				.setTitle(title)
				.setDescription(register)
				.setFooter('Use the reactions below to confirm or cancel.');

			if (chnlMsg) attendanceEmbed.setAuthor(`${formationName} (Update)`, msg.guild.iconURL());

			sendDM(msg.author, attendanceEmbed, msg.channel)
				.then(dm => {
					const sendAttendance = async () => {
						attendanceEmbed.setAuthor(`${formationName} (${msg.member.displayName})`, msg.guild.iconURL());

						if (chnlMsg) {
							attendanceEmbed.setFooter(`Last updated at ${await dtg()}`);

							const findFormation = role => role.name === formationName;
							const formationDisplay = msg.guild.roles.cache.find(findFormation) || `**${formationName}**`;

							embedScaffold(guild, msg.channel, `${msg.author} Successfully updated attendance for ${formationDisplay}.`, colours.success, 'msg');

							chnlMsg.edit(attendanceEmbed);
							attMsg.edit(attendanceEmbed);
						}

						else {
							const attendanceChannel = bot.channels.cache.get(attendanceID);

							attendanceEmbed.setFooter(await dtg());

							sendMsg(attendanceChannel, attendanceEmbed);
							sendMsg(msg.channel, attendanceEmbed);
						}
					};

					confirmation(msg, dm, sendAttendance);
				});
		}
	};

	return attendance;
};