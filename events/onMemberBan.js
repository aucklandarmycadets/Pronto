'use strict';

const Discord = require('discord.js');

const { dateTimeGroup } = require('../modules');
const { database, debugError, sendMsg } = require('../handlers');

module.exports = {
	bot: ['guildBanAdd', 'guildBanRemove'],
	process: [],
	/**
	 * Event handler to log whenever a member is banned or unbanned from a \<Guild>
	 * @param {'guildBanAdd' | 'guildBanRemove'} event The event that was emitted
	 * @param {Discord.Guild} guild The \<Guild> that the ban/unban occured in
	 * @param {Discord.User} user The \<User> that was banned/unbanned
	 */
	async handler(event, guild, user) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await database(guild);

		// Fetch the guild's audit logs for a ban/unban and store the whether the user was banned/unbanned
		const [fetchedLogs, banAction] = (event === 'guildBanAdd')
			? [await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' }).catch(error => debugError(error, 'Error fetching audit logs.')), 'Banned']
			: [await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_REMOVE' }).catch(error => debugError(error, 'Error fetching audit logs.')), 'Unbanned'];

		// Create log embed
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(`Member ${banAction}`, user.displayAvatarURL({ dynamic: true }))
			// Set colour dynamically, depending on the emitted event
			.setColor((event === 'guildBanAdd') ? colours.error : colours.success)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${user} ${user.tag}`)
			.setFooter(`ID: ${user.id} | ${await dateTimeGroup()}`);

		if (fetchedLogs) {
			// If the audit logs were successfully fetched, extract the executor and target from the ban audit entry
			const { executor, target } = fetchedLogs.extries.first();
			// If the audit log target matches the banned <User>, add a field to the log embed including the executor's tag
			if (target.id === user.id) logEmbed.addField(`${banAction} By`, executor.toString());
		}

		// Get the guild's log channel and send the log embed
		const log = bot.channels.cache.get(logID);
		sendMsg(log, { embeds: [logEmbed] });
	},
};