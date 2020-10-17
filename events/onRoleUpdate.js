const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput }, ids: { logID }, colours } = require('../config');
const { sendMsg } = require('../modules');

module.exports = {
	events: ['roleCreate', 'roleDelete'],
	process: [],
	execute(event, role) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(role.guild.name, role.guild.iconURL())
			.setFooter(`ID: ${role.id} | ${dateFormat(dateOutput)}`);

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