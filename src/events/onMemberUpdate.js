'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup, updatedPermissions } = require('../modules');
const { debugError, findGuildConfiguration, sendMsg, verifyBotPermissions } = require('../handlers');

/**
 * @member {events.EventModule} events.onMemberUpdate Event handler to log whenever a \<GuildMember> changes their nickname, or has a role added/removed
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['guildMemberUpdate'],
	process: [],
	/**
	 * @param {'guildMemberUpdate'} _ The event that was emitted
	 * @param {Discord.GuildMember} oldMember The \<GuildMember> before the update
	 * @param {Discord.GuildMember} newMember The \<GuildMember> after the update
	 */
	async handler(_, oldMember, newMember) {
		const { bot } = require('../pronto');
		const { ids: { logId }, colours } = await findGuildConfiguration(newMember.guild);

		// Initialise log embed
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(newMember.user.tag, newMember.user.displayAvatarURL({ dynamic: true }))
			.setColor(colours.warn)
			.setFooter(`Id: ${newMember.id} | ${await dateTimeGroup(newMember.guild)}`);

		// Initialise a variable to store the fetched logs if they exist
		let fetchedLogs;

		// Find if there are any differences between the roles of newMember and oldMember
		// i.e. if they have had a role added/removed
		const roleDifference = newMember.roles.cache.difference(oldMember.roles.cache).first();

		if (roleDifference) {
			// If there has been a role added/removed, set the log embed's description field accordingly
			logEmbed.setDescription(`**${newMember} was ${(newMember.roles.cache.some(role => role.id === roleDifference.id)) ? 'added to' : 'removed from'}** ${roleDifference}`);

			// If the <GuildMember> is a bot, use modules.updatedPermissions() to find the resultant changes in the bot's permissions
			// Then, pass it to handlers.verifyBotPermissions() to see if the changes have resolved the missing but required permissions
			if (newMember.id === bot.user.id) verifyBotPermissions(newMember.guild, updatedPermissions(oldMember, newMember));

			// Fetch the guild's audit logs for a member role update
			fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_ROLE_UPDATE' })
				.catch(error => debugError(newMember.guild, error, 'Error fetching audit logs.'));
		}

		else if (newMember.displayName !== oldMember.displayName) {
			// Otherwise, if the <GuildMember> has had their nickname changed, set the log embed accordingly
			logEmbed.setDescription(`**Nickname for ${newMember} changed**`);
			logEmbed.addField('Before', oldMember.displayName);
			logEmbed.addField('After', newMember.displayName);

			// Fetch the guild's audit logs for a member update
			fetchedLogs = await newMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_UPDATE' })
				.catch(error => debugError(newMember.guild, error, 'Error fetching audit logs.'));
		}

		// For any other actions which may have emitted <Client>#guildMemberUpdate, cease further execution
		else return;

		if (fetchedLogs) {
			// If the audit logs were successfully fetched, extract the executor and target from the audit entry
			const { executor, target } = fetchedLogs.entries.first();

			// If the audit log target matches the updated <GuildMember>, edit the log embed description to include the executor's tag
			if (target.id === newMember.id) logEmbed.setDescription(`${logEmbed.description} **by** ${executor}`);
		}

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logId);
		sendMsg(logChannel, { embeds: [logEmbed] });
	},
};