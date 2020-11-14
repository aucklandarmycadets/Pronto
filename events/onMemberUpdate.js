'use strict';

const Discord = require('discord.js');
const { dtg, debugError, sendMsg, updatedPermissions } = require('../modules');
const { botPermsHandler } = require('../handlers');

module.exports = {
	events: ['guildMemberUpdate'],
	process: [],
	async execute(_, oldMember, newMember) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(newMember.guild);

		const log = bot.channels.cache.get(logID);
		const roleDifference = newMember.roles.cache.difference(oldMember.roles.cache).first();
		const newMemberUser = newMember.user;

		const logEmbed = new Discord.MessageEmbed();

		if (roleDifference) {
			if (newMember.roles.cache.some(role => role.id === roleDifference.id)) {
				logEmbed.setDescription(`**${newMemberUser} was added to** ${roleDifference}`);
			}

			else if (oldMember.roles.cache.some(role => role.id === roleDifference.id)) {
				logEmbed.setDescription(`**${newMemberUser} was removed from** ${roleDifference}`);
			}

			if (newMember.id === bot.user.id) {
				const changedPerms = updatedPermissions(oldMember, newMember);
				botPermsHandler(newMember.guild, changedPerms);
			}

			const fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_ROLE_UPDATE' })
				.catch(error => debugError(error, 'Error fetching audit logs.'));

			const roleUpdateLog = (fetchedLogs)
				? fetchedLogs.entries.first()
				: null;

			if (roleUpdateLog) {
				const { executor, target } = roleUpdateLog;

				if (target.id === newMember.id) logEmbed.setDescription(`${logEmbed.description} by ${executor}`);
			}
		}

		else if (newMember.displayName !== oldMember.displayName) {
			logEmbed.setDescription(`**Nickname for ${newMemberUser} changed**`);
			logEmbed.addField('Before', oldMember.displayName);
			logEmbed.addField('After', newMember.displayName);
		}

		else return;

		logEmbed.setAuthor(newMemberUser.tag, newMemberUser.displayAvatarURL({ dynamic: true }));
		logEmbed.setColor(colours.warn);
		logEmbed.setFooter(`ID: ${newMemberUser.id} | ${await dtg()}`);
		sendMsg(log, logEmbed);
	},
};