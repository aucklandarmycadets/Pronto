'use strict';

const Discord = require('discord.js');
const { deleteMsg, dateTimeGroup, sendMsg } = require('../modules');

module.exports = {
	bot: ['messageDeleteBulk'],
	process: [],
	/**
	 * Event handler to log whenever messages are deleted in bulk, and delete the purge command message if it exists
	 * @param {'messageDeleteBulk'} _ The event that was emitted
	 * @param {Discord.Collection<Discord.Snowflake, Discord.Message>} msgs The deleted messages, mapped by their ID
	 */
	async handler(_, msgs) {
		const { bot } = require('../pronto');
		const { ids: { logID }, cmds: { purge }, colours } = await require('../handlers/database')(msgs.first().guild);

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

		// However, if there was was indeed a remaining message, check to see if it was a commands\purge.js command
		else if (lastMsg.content.includes(purge.cmd) || purge.aliases.some(alias => lastMsg.content.includes(alias))) {
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