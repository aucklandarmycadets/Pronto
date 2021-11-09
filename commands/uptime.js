'use strict';

const Discord = require('discord.js');
const { dtg, formatAge, sendMsg } = require('../modules');

module.exports = async guild => {
	const { cmds: { uptime }, colours } = await require('../handlers/database')(guild);

	uptime.execute = async msg => {
		const { bot, version } = require('../pronto');

		const uptimeEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setFooter(`${formatAge(bot.uptime, true)} | ${await dtg()} | Pronto v${version}`);

		sendMsg(msg.channel, { embeds: [uptimeEmbed] });
	};

	return uptime;
};