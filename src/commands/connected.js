'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup, sortMembersByRoles } = require('../modules');
const { commandError, findGuildConfiguration, sendMsg, successReact } = require('../handlers');

/**
 * @member {commands.Command} commands.connected
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { attendanceId }, commands: { connected }, colours } = await findGuildConfiguration(guild);

	/**
	 * List the members connected to a \<VoiceChannel>
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	connected.execute = async ({ msg }) => {
		const { bot } = require('../pronto');

		// Extract the first mentioned channel
		const channel = msg.mentions.channels.first();

		try {
			// Ensure there was at least one <GuildChannel> mentioned
			if (msg.mentions.channels.size === 0) throw 'You must specify a voice channel.';

			// Ensure <GuildChannel> is of type <VoiceChannel>
			else if (msg.mentions.channels.some(mention => mention.type !== 'voice')) throw 'Input must be a voice channel.';

			// Ensure there was only one channel mentioned
			else if (msg.mentions.channels.size > 1) throw 'You can only display one channel at a time.';
		}

		catch (error) { return commandError(msg, error, connected.error, 'Note: Use the <#channelId> syntax!'); }

		// Sort connected members in descending order according to their highest (non-administrator) role, then map the <Collection> to a string[] of member mentions
		const connectedMembers = channel.members.sort(await sortMembersByRoles(guild)).map(member => member.toString());

		// Return an error message if there are no members connected to the channel
		if (connectedMembers.length === 0) return commandError(msg, `There are no members connected to ${channel}.`, connected.error, 'Note: Use the <#channelId> syntax!');

		// Success react to command message
		successReact(msg);

		// Get the guild's attendance channel
		const attendanceChannel = bot.channels.cache.get(attendanceId);

		// Create connected embed and send to the attendance channel
		const connectedEmbed = new Discord.MessageEmbed()
			.setTitle(`Members Connected to #${channel.name}`)
			.setColor(colours.success)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			// Join the connectedMembers string[] with a newline separator
			.setDescription(connectedMembers.join('\n'))
			.setFooter(await dateTimeGroup());

		// Send the connected embed to the attendance channel
		sendMsg(attendanceChannel, { embeds: [connectedEmbed] });
	};

	return connected;
};