'use strict';

const Discord = require('discord.js');
const { dtg, formatAge, sendMsg } = require('../modules');

module.exports = async guild => {
	const { cmds: { uptime } } = await require('../cmds')(guild);
	const { colours } = await require('../handlers/database')(guild);

	uptime.execute = msg => {
		const { bot, version } = require('../pronto');

		const uptimeEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setFooter(`${formatAge(bot.uptime)} | ${dtg()} | Pronto v${version}`);

		sendMsg(msg.channel, uptimeEmbed);
	};

	return uptime;
};