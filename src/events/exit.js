'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');
const mongoose = require('mongoose');

const { ids: { DEVELOPER_ID } } = require('../config');
const { dateTimeGroup, formatDuration } = require('../modules');
const { findGuildConfiguration, sendDirect } = require('../handlers');

/**
 * @member {events.EventModule} events.exit Event handler to notify the developer that the bot is restarting, and to close the MongoDB connection
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: [],
	process: ['exit', 'SIGINT'],
	/**
	 * @param {'exit' | 'SIGINT'} event The event that was emitted
	 * @param {number} [code] The code to exit with
	 */
	async handler(event, code) {
		const { bot, version } = require('../pronto');

		// If the event that was emitted was Process#exit, log the code to the console along with the bot's uptime
		if (event === 'exit') console.log(`Exiting with code ${code}, uptime of ${formatDuration(bot.uptime, true)}`);

		// Asynchronous operations below this point are abandoned when handling Process#exit, and the process terminates here

		const { colours } = await findGuildConfiguration();

		// Create restart embed
		const restartEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setDescription('**Restarting...**')
			// Parse <Client.uptime> through modules.formatDuration()
			.addField('Uptime', formatDuration(bot.uptime, true))
			.setColor(colours.warn)
			.setFooter(`${await dateTimeGroup()} | Pronto v${version}`);

		// Fetch the developer's <User> and send the restart embed to them
		const developer = await bot.users.fetch(DEVELOPER_ID);
		await sendDirect(developer, { embeds: [restartEmbed] }, null, true);

		// Close the MongoDB connection
		await mongoose.connection.close(() => console.log('Disconnected from Mongoose'));

		// Explicitly call the process.exit() method with a code of 0 to terminate the process
		process.exit(0);
	},
};