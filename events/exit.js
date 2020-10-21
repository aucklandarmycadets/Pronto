const Discord = require('discord.js');

const { ids: { devID }, colours } = require('../config');
const { dtg, formatAge, sendMsg } = require('../modules');

module.exports = {
	events: [],
	process: ['exit', 'SIGINT'],
	execute() {
		'use strict';

		const { bot, version } = require('../pronto.js');

		const dev = bot.users.cache.get(devID);

		const restartEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL())
			.setDescription('**Restarting...**')
			.addField('Uptime', formatAge(bot.uptime))
			.setColor(colours.warn)
			.setFooter(`${dtg()} | Pronto v${version}`);

		sendMsg(dev, restartEmbed, true);
	},
};