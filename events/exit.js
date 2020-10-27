'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');

const { ids: { devID }, colours } = require('../config');
const { dtg, formatAge, sendDM } = require('../modules');

module.exports = {
	events: [],
	process: ['exit', 'SIGINT'],
	async execute(event, code) {
		const { bot, version } = require('../pronto');

		if (event === 'exit') console.log(`Exiting with code ${code}, uptime of ${formatAge(bot.uptime)}`);

		const dev = bot.users.cache.get(devID);

		const restartEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL())
			.setDescription('**Restarting...**')
			.addField('Uptime', formatAge(bot.uptime))
			.setColor(colours.warn)
			.setFooter(`${dtg()} | Pronto v${version}`);

		await sendDM(dev, restartEmbed, true);

		await mongoose.connection.close(() => console.log('Disconnected from Mongoose'));

		process.exit();
	},
};