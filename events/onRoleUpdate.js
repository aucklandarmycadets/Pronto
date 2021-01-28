'use strict';

const Discord = require('discord.js');
const { dtg, sendMsg } = require('../modules');

module.exports = {
	events: ['roleCreate', 'roleDelete'],
	process: [],
	async execute(event, role) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(role.guild);

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(role.guild.name, role.guild.iconURL({ dynamic: true }))
			.setFooter(`ID: ${role.id} | ${await dtg()}`);

		if (event === 'roleCreate') {
			logEmbed.setColor(colours.success);
			logEmbed.setDescription(`**Role Created: ${role.name}**`);
		}

		else {
			logEmbed.setColor(colours.error);
			logEmbed.setDescription(`**Role Deleted: ${role.name}**`);
		}

		sendMsg(log, logEmbed);
	},
};