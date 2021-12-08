'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup } = require('../modules');
const { findGuildConfiguration, sendMsg } = require('../handlers');

/**
 * @member {commands.Command} commands.ping Calculate the latency of the bot
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { commands: { ping }, colours } = await findGuildConfiguration(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	ping.execute = ({ msg }) => {
		const { version } = require('../pronto');

		// Send initial pong message
		sendMsg(msg.channel, { content: '**Pong!**' })
			.then(async pong => {
				// If the original ping message has been edited, use the edit timestamp instead of the created timestamp
				const pingTimestamp = (msg.editedTimestamp > msg.createdTimestamp)
					? msg.editedTimestamp
					: msg.createdTimestamp;

				// Create pong embed
				const pongEmbed = new Discord.MessageEmbed()
					.setColor(colours.success)
					// Calculate the delay between the ping timestamp and the pong message
					.setFooter(`${pong.createdTimestamp - pingTimestamp} ms | ${await dateTimeGroup()} | Pronto v${version}`);

				// Edit the initial pong message and add the pong embed
				pong.edit({ embeds: [pongEmbed] });
			});
	};

	return ping;
};