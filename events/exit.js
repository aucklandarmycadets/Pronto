'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');

const { ids: { devID } } = require('../config');
const { dtg, formatAge, sendDM } = require('../modules');

module.exports = {
	events: [],
	process: ['exit', 'SIGINT'],
	async execute(event, code) {
		const { bot, version } = require('../pronto');

		if (event === 'exit') console.log(`Exiting with code ${code}, uptime of ${formatAge(bot.uptime, true)}`);

		const { colours } = await require('../handlers/database')();

		const dev = await bot.users.fetch(devID);

		const restartEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setDescription('**Restarting...**')
			.addField('Uptime', formatAge(bot.uptime, true))
			.setColor(colours.warn)
			.setFooter(`${await dtg()} | Pronto v${version}`);

		await sendDM(dev, { embeds: [restartEmbed] }, null, true);

		await mongoose.connection.close(() => console.log('Disconnected from Mongoose'));

		process.exit();
	},
};