'use strict';

const Discord = require('discord.js');
const { cmdError, dateTimeGroup, sendMsg, sortByRoles, successReact } = require('../modules');

/**
 * Attach the cmd.execute() function to command object
 * @module commands/connected
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Object.<string, string | string[] | boolean | Function>>} The complete command object with a cmd.execute() property
 */
module.exports = async guild => {
	const { ids: { attendanceID }, cmds: { connected }, colours } = await require('../handlers/database')(guild);

	/**
	 * List the members connected to a <VoiceChannel>
	 * @param {Discord.Message} msg The \<Message> that executed the command
	 * @param {string[]} args The command arguments
	 */
	connected.execute = async msg => {
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

		catch (error) { return cmdError(msg, error, connected.error, 'Note: Use the <#channelID> syntax!'); }

		// Sort connected members in descending order according to their highest (non-administrator) role, then map the <Collection> to a string[] of member mentions
		const connectedMembers = channel.members.sort(sortByRoles(guild)).map(member => member.toString());

		// Return an error message if there are no members connected to the channel
		if (connectedMembers.length === 0) return cmdError(msg, `There are no members connected to ${channel}.`, connected.error, 'Note: Use the <#channelID> syntax!');

		// Success react to command message
		successReact(msg);

		// Get the guild's attendance channel
		const attendanceChannel = bot.channels.cache.get(attendanceID);

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