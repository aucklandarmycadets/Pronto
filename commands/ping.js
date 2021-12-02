'use strict';

const Discord = require('discord.js');
const { dateTimeGroup, sendMsg } = require('../modules');

/**
 * Attach the cmd.execute() function to command object
 * @module commands/ping
 * @param {Discord.Guild} guild The guild that the member shares with the bot
 * @returns {Promise<Object.<string, string | string[] | boolean | Function>>} The complete command object with a cmd.execute() property
 */
module.exports = async guild => {
	const { cmds: { ping }, colours } = await require('../handlers/database')(guild);

	/**
	 * Calculate the latency of the bot
	 * @param {Discord.Message} msg The \<Message> that executed the command
	 */
	ping.execute = msg => {
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