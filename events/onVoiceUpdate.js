'use strict';

const Discord = require('discord.js');

const { dateTimeGroup } = require('../modules');
const { database, channelPairing, sendMsg } = require('../handlers');

module.exports = {
	bot: ['voiceStateUpdate'],
	process: [],
	/**
	 * Event handler to log whenever a \<GuildMember> joins/leaves a \<VoiceChannel>,
	 * and to trigger `handlers.channelPairing()`
	 * @param {'voiceStateUpdate'} _ The event that was emitted
	 * @param {Discord.VoiceState} oldState The \<VoiceState> before the update
	 * @param {Discord.VoiceState} newState The \<VoiceState> after the update
	 */
	async handler(_, oldState, newState) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await database(newState.guild);

		// Call handlers.channelPairing() to process channel pairing functionality in case the <VoiceChannel> is paired to a <TextChannel>
		channelPairing(oldState, newState);

		// Initialise log embed
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL({ dynamic: true }));

		// Extract the <VoiceChannel.id> of the old <VoiceChannel> if it exists
		// i.e. if the <GuildMember> has either left or changed channels
		const oldChannelID = (oldState.channel)
			? oldState.channelID
			: null;

		// Extract the <VoiceChannel.id> of the new <VoiceChannel> if it exists
		// i.e. if the <GuildMember> has joined or changed channels
		const newChannelID = (newState.channel)
			? newState.channelID
			: null;

		if (!oldChannelID) {
			// If there is no old <VoiceChannel>, i.e. the <GuildMember> has joined a <VoiceChannel>, set the log embed accordingly
			logEmbed.setColor(colours.success);
			logEmbed.setDescription(`**${newState.member} joined voice channel ${newState.channel}**`);
			logEmbed.setFooter(`ID: ${newState.member.id} | Channel: ${newChannelID} | ${await dateTimeGroup()}`);
		}

		else if (!newChannelID) {
			// Otherwise, if there is no new <VoiceChannel>, i.e. the <GuildMember> has left a <VoiceChannel>, set the log embed accordingly
			logEmbed.setColor(colours.error);
			logEmbed.setDescription(`**${newState.member} left voice channel ${oldState.channel}**`);
			logEmbed.setFooter(`ID: ${newState.member.id} | Channel: ${oldChannelID} | ${await dateTimeGroup()}`);
		}

		else if (oldChannelID !== newChannelID) {
			// Otherwise, if the two <VoiceChannel.id> snowflakes do not match, i.e. the <GuildMember> has changed from one <VoiceChannel> to another, set the log embed accordingly
			logEmbed.setColor(colours.warn);
			logEmbed.setDescription(`**${newState.member} changed voice channel ${oldState.channel} > ${newState.channel}**`);
			logEmbed.setFooter(`ID: ${newState.member.id} | ${await dateTimeGroup()}`);
		}

		// For any other actions which may have emitted <Client>#voiceStateUpdate, cease further execution
		else return;

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });

	},
};