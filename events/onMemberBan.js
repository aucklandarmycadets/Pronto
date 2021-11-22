'use strict';

const Discord = require('discord.js');
const { debugError, dtg, sendMsg } = require('../modules');

module.exports = {
	events: ['guildBanAdd', 'guildBanRemove'],
	process: [],
	async handler(event, guild, user) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(guild);

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed();

		let fetchedLogs, type;

		if (event === 'guildBanAdd') {
			logEmbed.setColor(colours.error);
			logEmbed.setAuthor('Member Banned', user.displayAvatarURL({ dynamic: true }));

			type = 'Banned';
			fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' })
				.catch(error => debugError(error, 'Error fetching audit logs.'));
		}

		else {
			logEmbed.setColor(colours.success);
			logEmbed.setAuthor('Member Unbanned', user.displayAvatarURL({ dynamic: true }));

			type = 'Unbanned';
			fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_REMOVE' })
				.catch(error => debugError(error, 'Error fetching audit logs.'));
		}

		logEmbed.setThumbnail(user.displayAvatarURL({ dynamic: true }));
		logEmbed.setDescription(`${user} ${user.tag}`);
		logEmbed.setFooter(`ID: ${user.id} | ${await dtg()}`);

		const banLog = (fetchedLogs)
			? fetchedLogs.entries.first()
			: null;

		if (banLog) {
			const { executor, target } = banLog;
			if (target.id === user.id) logEmbed.addField(`${type} By`, executor.toString());
		}

		sendMsg(log, { embeds: [logEmbed] });
	},
};