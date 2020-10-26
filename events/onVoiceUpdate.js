'use strict';

const Discord = require('discord.js');

const { ids: { logID }, colours } = require('../config');
const { dtg, sendMsg } = require('../modules');
const { channelPairing } = require('../handlers');

module.exports = {
	events: ['voiceStateUpdate'],
	process: [],
	execute(event, oldState, newState) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
		const newMember = newState.member;

		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(newMember.displayName, newMember.user.displayAvatarURL());

		const oldID = (oldState.channel)
			? oldState.channelID
			: null;

		const newID = (newState.channel)
			? newState.channelID
			: null;

		if (!oldID) {
			logEmbed.setColor(colours.success);
			logEmbed.setDescription(`**${newMember} joined voice channel ${newState.channel}**`);
			logEmbed.setFooter(`ID: ${newMember.id} | Channel: ${newID} | ${dtg()}`);
		}

		else if (!newID) {
			logEmbed.setColor(colours.error);
			logEmbed.setDescription(`**${newMember} left voice channel ${oldState.channel}**`);
			logEmbed.setFooter(`ID: ${newMember.id} | Channel: ${oldID} | ${dtg()}`);
		}

		else if (oldID !== newID) {
			logEmbed.setColor(colours.warn);
			logEmbed.setDescription(`**${newMember} changed voice channel ${oldState.channel} > ${newState.channel}**`);
			logEmbed.setFooter(`ID: ${newMember.id} | ${dtg()}`);
		}

		else return;

		sendMsg(log, logEmbed);
		channelPairing(oldState, newState);
	},
};