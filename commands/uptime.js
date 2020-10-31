'use strict';

const Discord = require('discord.js');
const { dtg, formatAge, sendMsg } = require('../modules');

module.exports = async guild => {
	const { uptime } = await require('../cmds')(guild);
	const { colours } = await require('../handlers/database')(guild);

	uptime.execute = async msg => {
		const { bot, version } = require('../pronto');

		const uptimeEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setFooter(`${formatAge(bot.uptime)} | ${await dtg()} | Pronto v${version}`);

		sendMsg(msg.channel, uptimeEmbed);
	};

	return uptime;
};