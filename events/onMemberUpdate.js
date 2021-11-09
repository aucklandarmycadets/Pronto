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

		const logEmbed = new Discord.MessageEmbed();

		let fetchedLogs;

		if (roleDifference) {
			if (newMember.roles.cache.some(role => role.id === roleDifference.id)) {
				logEmbed.setDescription(`**${newMember.user} was added to** ${roleDifference}`);
			}

			else if (oldMember.roles.cache.some(role => role.id === roleDifference.id)) {
				logEmbed.setDescription(`**${newMember.user} was removed from** ${roleDifference}`);
			}

			if (newMember.id === bot.user.id) {
				const changedPerms = updatedPermissions(oldMember, newMember);
				botPermsHandler(newMember.guild, changedPerms);
			}

			fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_ROLE_UPDATE' })
				.catch(error => debugError(error, 'Error fetching audit logs.'));
		}

		else if (newMember.displayName !== oldMember.displayName) {
			logEmbed.setDescription(`**Nickname for ${newMember.user} changed**`);
			logEmbed.addField('Before', oldMember.displayName);
			logEmbed.addField('After', newMember.displayName);

			fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_UPDATE' })
				.catch(error => debugError(error, 'Error fetching audit logs.'));
		}

		else return;

		const roleUpdateLog = (fetchedLogs)
			? fetchedLogs.entries.first()
			: null;

		if (roleUpdateLog) {
			const { executor, target } = roleUpdateLog;

			if (target.id === newMember.id) logEmbed.setDescription(`${logEmbed.description} **by** ${executor}`);
		}

		logEmbed.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL({ dynamic: true }));
		logEmbed.setColor(colours.warn);
		logEmbed.setFooter(`ID: ${newMember.user.id} | ${await dtg()}`);
		sendMsg(log, { embeds: [logEmbed] });
	},
};