'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { dateTimeGroup } = require('../modules');
const { database, deleteMsg, sendMsg } = require('../handlers');

/**
 * @member {events.EventModule} events.onBulkDelete Event handler to log whenever messages are deleted in bulk, and delete the purge command message if it exists
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['messageDeleteBulk'],
	process: [],
	/**
	 * @param {'messageDeleteBulk'} _ The event that was emitted
	 * @param {Discord.Collection<Discord.Snowflake, Discord.Message>} msgs The deleted messages, mapped by their ID
	 */
	async handler(_, msgs) {
		const { bot } = require('../pronto');
		const { ids: { logID }, commands: { purge }, colours } = await database(msgs.first().guild);

		// Extract the first deleted message to access a <Message> instance
		const msg = msgs.first();
		// Attempt to get the last message in the <TextChannel>
		// This may be null if the <TextChannel> was completely emptied
		const lastMsg = msg.channel.lastMessage;

		// Initialise log embed
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error)
			.setFooter(await dateTimeGroup());

		if (!lastMsg) {
			// If the channel was completely emptied, then there is not any <Message> to extract further context from
			logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }));
			logEmbed.setDescription(`**${msgs.array().length} messages bulk deleted in ${msg.channel}**`);
		}

		// However, if there was was indeed a remaining message, check to see if it was a commands\purge.js <Command>
		else if (lastMsg.content.includes(purge.command) || purge.aliases.some(alias => lastMsg.content.includes(alias))) {
			// If it was, delete the command message
			deleteMsg(lastMsg);

			// Add additional context to the log embed on the command author
			logEmbed.setAuthor(lastMsg.author.tag, lastMsg.author.displayAvatarURL({ dynamic: true }));
			logEmbed.setDescription(`**${msgs.array().length} messages bulk deleted by ${lastMsg.author} in ${msg.channel}**`);
		}

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });
	},
};