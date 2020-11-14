'use strict';

const Discord = require('discord.js');
const { dtg, sendMsg } = require('../modules');
const { channelPairing } = require('../handlers');

module.exports = {
	events: ['voiceStateUpdate'],
	process: [],
	async execute(_, oldState, newState) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(newState.guild);

		const log = bot.channels.cache.get(logID);
		const newMember = newState.member;

		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(newMember.displayName, newMember.user.displayAvatarURL({ dynamic: true }));

		const oldID = (oldState.channel)
			? oldState.channelID
			: null;

		const newID = (newState.channel)
			? newState.channelID
			: null;

		if (!oldID) {
			logEmbed.setColor(colours.success);
			logEmbed.setDescription(`**${newMember} joined voice channel ${newState.channel}**`);
			logEmbed.setFooter(`ID: ${newMember.id} | Channel: ${newID} | ${await dtg()}`);
		}

		else if (!newID) {
			logEmbed.setColor(colours.error);
			logEmbed.setDescription(`**${newMember} left voice channel ${oldState.channel}**`);
			logEmbed.setFooter(`ID: ${newMember.id} | Channel: ${oldID} | ${await dtg()}`);
		}

		else if (oldID !== newID) {
			logEmbed.setColor(colours.warn);
			logEmbed.setDescription(`**${newMember} changed voice channel ${oldState.channel} > ${newState.channel}**`);
			logEmbed.setFooter(`ID: ${newMember.id} | ${await dtg()}`);
		}

		else return;

		sendMsg(log, logEmbed);
		channelPairing(oldState, newState);
	},
};