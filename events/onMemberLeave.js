'use strict';

const Discord = require('discord.js');
const { debugError, dtg, rolesOutput, sendMsg } = require('../modules');

module.exports = {
	events: ['guildMemberRemove'],
	process: [],
	async execute(_, member) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(member.guild);

		const log = bot.channels.cache.get(logID);
		const memberUser = member.user;
		const memberRoles = member.roles.cache.array();

		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error)
			.setAuthor('Member Left', memberUser.displayAvatarURL({ dynamic: true }))
			.setThumbnail(memberUser.displayAvatarURL({ dynamic: true }))
			.setDescription(`${memberUser} ${memberUser.tag}`)
			.addField('Roles', rolesOutput(memberRoles, true, 3))
			.setFooter(`ID: ${memberUser.id} | ${await dtg()}`);

		const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' })
			.catch(error => debugError(error, 'Error fetching audit logs.'));

		const kickLog = (fetchedLogs)
			? fetchedLogs.entries.first()
			: null;

		if (kickLog) {
			const { executor, target } = kickLog;

			if (target.id === member.id) {
				logEmbed.setAuthor('Member Kicked', memberUser.displayAvatarURL({ dynamic: true }));
				logEmbed.addField('Kicked By', executor.toString());
			}
		}

		let isBan;

		try { isBan = await member.guild.fetchBan(member); }
		catch { null; }

		if (!isBan) sendMsg(log, { embeds: [logEmbed] });
	},
};