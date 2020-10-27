'use strict';

const Discord = require('discord.js');
const { dtg, sendMsg } = require('../modules');

module.exports = {
	events: ['guildBanAdd', 'guildBanRemove'],
	process: [],
	async execute(event, guild, member) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(guild);

		const log = bot.channels.cache.get(logID);
		const logEmbed = new Discord.MessageEmbed();

		if (event === 'guildBanAdd') {
			logEmbed.setColor(colours.error);
			logEmbed.setAuthor('Member Banned', member.displayAvatarURL());
		}

		else {
			logEmbed.setColor(colours.success);
			logEmbed.setAuthor('Member Unbanned', member.displayAvatarURL());
		}

		logEmbed.setThumbnail(member.displayAvatarURL());
		logEmbed.setDescription(`${member} ${member.tag}`);
		logEmbed.setFooter(`ID: ${member.id} | ${await dtg()}`);
		sendMsg(log, logEmbed);
	},
};