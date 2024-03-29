'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup } = require('../modules');
const { debugError, findGuildConfiguration, sendMsg } = require('../handlers');

/**
 * @member {events.EventModule} events.onMemberBan Event handler to log whenever a member is banned or unbanned from a \<Guild>
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['guildBanAdd', 'guildBanRemove'],
	process: [],
	/**
	 * @param {'guildBanAdd' | 'guildBanRemove'} event The event that was emitted
	 * @param {Discord.Guild} guild The \<Guild> that the ban/unban occurred in
	 * @param {Discord.User} user The \<User> that was banned/unbanned
	 */
	async handler(event, guild, user) {
		const { bot } = require('../pronto');
		const { ids: { logId }, colours } = await findGuildConfiguration(guild);

		// Fetch the guild's audit logs for a ban/unban and store the whether the user was banned/unbanned
		const [fetchedLogs, banAction] = (event === 'guildBanAdd')
			? [await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_ADD' }).catch(error => debugError(guild, error, 'Error fetching audit logs.')), 'Banned']
			: [await guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_BAN_REMOVE' }).catch(error => debugError(guild, error, 'Error fetching audit logs.')), 'Unbanned'];

		// Create log embed
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(`Member ${banAction}`, user.displayAvatarURL({ dynamic: true }))
			// Set colour dynamically, depending on the emitted event
			.setColor((event === 'guildBanAdd') ? colours.error : colours.success)
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${user} ${user.tag}`)
			.setFooter(`Id: ${user.id} | ${await dateTimeGroup(guild)}`);

		if (fetchedLogs) {
			// If the audit logs were successfully fetched, extract the executor and target from the ban audit entry
			const { executor, target } = fetchedLogs.extries.first();
			// If the audit log target matches the banned <User>, add a field to the log embed including the executor's tag
			if (target.id === user.id) logEmbed.addField(`${banAction} By`, executor.toString());
		}

		// Get the guild's log channel and send the log embed
		const log = bot.channels.cache.get(logId);
		sendMsg(log, { embeds: [logEmbed] });
	},
};