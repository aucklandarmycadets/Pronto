'use strict';

const Discord = require('discord.js');
const { dateTimeGroup, formatAge, sendMsg } = require('../modules');

/**
 * Attach the cmd.execute() function to command object
 * @module commands/uptime
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Object.<string, string | string[] | boolean | Function>>} The complete command object with a cmd.execute() property
 */
module.exports = async guild => {
	const { cmds: { uptime }, colours } = await require('../handlers/database')(guild);

	/**
	 * Display the bot's uptime
	 * @param {Discord.Message} msg The \<Message> that executed the command
	 */
	uptime.execute = async msg => {
		const { bot, version } = require('../pronto');

		// Create uptime embed
		const uptimeEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			// Parse <Client>.uptime through modules.formatAge()
			.setFooter(`${formatAge(bot.uptime, true)} | ${await dateTimeGroup()} | Pronto v${version}`);

		// Send the uptime embed
		sendMsg(msg.channel, { embeds: [uptimeEmbed] });
	};

	return uptime;
};