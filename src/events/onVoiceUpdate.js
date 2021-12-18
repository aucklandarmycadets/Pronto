'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup } = require('../modules');
const { channelPairing, findGuildConfiguration, sendMsg } = require('../handlers');

/**
 * @member {events.EventModule} events.onVoiceUpdate Event handler to log whenever a \<GuildMember> joins/leaves a \<VoiceChannel>, and to trigger [`handlers.channelPairing()`]{@link handlers.channelPairing}
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['voiceStateUpdate'],
	process: [],
	/**
	 * @param {'voiceStateUpdate'} _ The event that was emitted
	 * @param {Discord.VoiceState} oldState The \<VoiceState> before the update
	 * @param {Discord.VoiceState} newState The \<VoiceState> after the update
	 */
	async handler(_, oldState, newState) {
		const { bot } = require('../pronto');
		const { ids: { logId }, colours } = await findGuildConfiguration(newState.guild);

		// Call handlers.channelPairing() to process channel pairing functionality in case the <VoiceChannel> is paired to a <TextChannel>
		channelPairing(oldState, newState);

		// Initialise log embed
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({ dynamic: true }));

		// Extract the <VoiceChannel.id> of the old <VoiceChannel> if it exists
		// i.e. if the <GuildMember> has either left or changed channels
		const oldChannelId = (oldState.channel)
			? oldState.channelId
			: null;

		// Extract the <VoiceChannel.id> of the new <VoiceChannel> if it exists
		// i.e. if the <GuildMember> has joined or changed channels
		const newChannelId = (newState.channel)
			? newState.channelId
			: null;

		if (!oldChannelId) {
			// If there is no old <VoiceChannel>, i.e. the <GuildMember> has joined a <VoiceChannel>, set the log embed accordingly
			logEmbed.setColor(colours.success);
			logEmbed.setDescription(`**${newState.member} joined voice channel ${newState.channel}**`);
			logEmbed.setFooter(`Id: ${newState.member.id} | Channel: ${newChannelId} | ${await dateTimeGroup(newState.guild)}`);
		}

		else if (!newChannelId) {
			// Otherwise, if there is no new <VoiceChannel>, i.e. the <GuildMember> has left a <VoiceChannel>, set the log embed accordingly
			logEmbed.setColor(colours.error);
			logEmbed.setDescription(`**${newState.member} left voice channel ${oldState.channel}**`);
			logEmbed.setFooter(`Id: ${newState.member.id} | Channel: ${oldChannelId} | ${await dateTimeGroup(newState.guild)}`);
		}

		else if (oldChannelId !== newChannelId) {
			// Otherwise, if the two <VoiceChannel.id> snowflakes do not match, i.e. the <GuildMember> has changed from one <VoiceChannel> to another, set the log embed accordingly
			logEmbed.setColor(colours.warn);
			logEmbed.setDescription(`**${newState.member} changed voice channel ${oldState.channel} > ${newState.channel}**`);
			logEmbed.setFooter(`Id: ${newState.member.id} | ${await dateTimeGroup(newState.guild)}`);
		}

		// For any other actions which may have emitted <Client>#voiceStateUpdate, cease further execution
		else return;

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logId);
		sendMsg(logChannel, { embeds: [logEmbed] });

	},
};