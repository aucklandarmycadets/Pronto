'use strict';

const Discord = require('discord.js');
const { dtg, rolesOutput, sendMsg } = require('../modules');

module.exports = {
	events: ['guildMemberRemove'],
	process: [],
	async execute(event, member) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(member.guild);

		const log = bot.channels.cache.get(logID);
		const memberUser = member.user;
		const memberRoles = member.roles.cache.array();

		const fetchedLogs = await member.guild.fetchAuditLogs({
			limit: 1,
			type: 'MEMBER_KICK',
		})
			.catch(error => debugError(error, 'Error fetching audit logs.'));

		const kickLog = (fetchedLogs)
			? fetchedLogs.entries.first()
			: null;

		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error)
			.setAuthor('Member Left', memberUser.displayAvatarURL())
			.setThumbnail(memberUser.displayAvatarURL())
			.setDescription(`${memberUser} ${memberUser.tag}`)
			.addField('Roles', rolesOutput(memberRoles, true))
			.setFooter(`ID: ${memberUser.id} | ${await dtg()}`);

		if (kickLog) {
			const { executor, target } = kickLog;

			if (target.id === member.id) {
				logEmbed.setAuthor('Member Kicked', memberUser.displayAvatarURL());
				logEmbed.addField('Kicked By', executor);
			}
		}

		sendMsg(log, logEmbed);
	},
};