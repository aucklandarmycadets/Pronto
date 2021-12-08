'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup, formatRoles } = require('../modules');
const { debugError, findGuildConfiguration, sendMsg } = require('../handlers');

/**
 * @member {events.EventModule} events.onMemberRemove Event handler to log whenever a \<GuildMember> leaves a guild, or is kicked
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['guildMemberRemove'],
	process: [],
	/**
	 * @param {'guildMemberRemove'} _ The event that was emitted
	 * @param {Discord.GuildMember} member The \<GuildMember> that has left/been kicked from the guild
	 */
	async handler(_, member) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await findGuildConfiguration(member.guild);

		// Create log embed
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error)
			.setAuthor('Member Left', member.user.displayAvatarURL({ dynamic: true }))
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${member} ${member.user.tag}`)
			// Call modules.formatRoles() to display the roles the <GuildMember> had
			.addField('Roles', formatRoles(member.roles.cache.array(), true, 3))
			.setFooter(`ID: ${member.id} | ${await dateTimeGroup()}`);

		// Fetch the guild's audit logs for a kick
		const fetchedLogs = await member.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_KICK' })
			.catch(error => debugError(error, 'Error fetching audit logs.'));

		if (fetchedLogs) {
			// If the audit logs were successfully fetched, extract the executor and target from the kick audit entry
			const { executor, target } = fetchedLogs.entries.first();

			// If the audit log target matches the kicked <GuildMember>, add a field to the log embed including the executor's tag
			if (target.id === member.id) {
				// Rename embed from 'left' to 'kicked'
				logEmbed.setAuthor('Member Kicked', member.user.displayAvatarURL({ dynamic: true }));
				logEmbed.addField('Kicked By', executor.toString());
			}
		}

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });
	},
};