const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput }, ids: { logID }, colours } = require('../config');
const { sendMsg } = require('../modules');

module.exports = {
	events: ['guildBanAdd', 'guildBanRemove'],
	process: [],
	execute(event, guild, member) {
		const { bot } = require('../pronto');

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
		logEmbed.setFooter(`ID: ${member.id} | ${dateFormat(dateOutput)}`);
		sendMsg(log, logEmbed);
	},
};