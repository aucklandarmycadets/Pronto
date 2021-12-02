'use strict';

const Discord = require('discord.js');
const { debugError, dateTimeGroup, formatAge, sendMsg } = require('../modules');

module.exports = {
	bot: ['guildMemberAdd'],
	process: [],
	/**
	 * Event handler to log whenever a user joins a \<Guild>, and to assign them to the guild's visitor role and send a welcome embed
	 * @param {'guildMemberAdd'} _ The event that was emitted
	 * @param {Discord.GuildMember} member The \<GuildMember> that has joined a \<Guild>
	 */
	async handler(_, member) {
		const { bot } = require('../pronto');
		const { ids: { logID, recruitingID, welcomeID, visitorID }, colours } = await require('../handlers/database')(member.guild);

		// Create log embed
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setAuthor('Member Joined', member.user.displayAvatarURL({ dynamic: true }))
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`${member} ${member.user.tag}`)
			// Parse the user's account age through modules.formatAge()
			.addField('Account Age', formatAge(member.user.createdAt))
			.setFooter(`ID: ${member.id} | ${await dateTimeGroup()}`);

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });

		// If the <GuildMember> is a bot, do not assign the visitor role or send a welcome embed
		if (member.user.bot) return;

		// Retrieve the guild's 'visitor' role
		const visitorRole = member.guild.roles.cache.find(visitorID);
		// Assign the visitor role to the <GuildMember>
		member.roles.add(visitorRole).catch(error => debugError(error, `Error adding ${member} to ${visitorRole}.`));

		// Get the guild's 'new members' channel
		const welcomeChannel = bot.channels.cache.get(welcomeID);

		// Create welcome embed
		const welcomeEmbed = new Discord.MessageEmbed()
			.setColor(colours.primary)
			.setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
			.setDescription(`**${member.displayName} has just entered ${welcomeChannel.name}.**\nMake them feel welcome!`)
			.addField('User', member.toString())
			.setFooter(await dateTimeGroup());

		// Get the guild's recruiting channel and send the welcome embed
		const recruiting = bot.channels.cache.get(recruitingID);
		sendMsg(recruiting, { embeds: [welcomeEmbed] });
	},
};