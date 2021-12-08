'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup, formatAge } = require('../modules');
const { database, sendMsg } = require('../handlers');

/**
 * @member {commands.Command} commands.uptime Display the bot's uptime
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { commands: { uptime }, colours } = await database(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	uptime.execute = async ({ msg }) => {
		const { bot, version } = require('../pronto');

		// Create uptime embed
		const uptimeEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			// Parse <Client.uptime> through modules.formatAge()
			.setFooter(`${formatAge(bot.uptime, true)} | ${await dateTimeGroup()} | Pronto v${version}`);

		// Send the uptime embed
		sendMsg(msg.channel, { embeds: [uptimeEmbed] });
	};

	return uptime;
};