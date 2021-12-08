'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { charLimit, dateTimeGroup } = require('../modules');
const { commandHandler, findGuildConfiguration, sendMsg } = require('../handlers');

/**
 * @member {events.EventModule} events.onMessageUpdate Event handler to log whenever a \<Message> is updated,
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['messageUpdate'],
	process: [],
	/**
	 * and to call `handlers.commandHandler()` in case it is a \<Command> to be executed
	 * @param {'messageUpdate'} _ The event that was emitted
	 * @param {Discord.Message} oldMessage The \<Message> before the update
	 * @param {Discord.Message} newMessage The \<Message> after the update
	 */
	async handler(_, oldMessage, newMessage) {
		const { bot } = require('../pronto');

		// Ensure the updated <Message> is not a partial by calling the <Message.fetch()> method
		if (newMessage.partial) await newMessage.fetch();

		const { ids: { logID }, colours } = await findGuildConfiguration(newMessage.guild);

		// Call handlers.commandHandler() to handle a potential command message
		commandHandler(newMessage);

		// Initialise log embed
		const logEmbed = new Discord.MessageEmbed()
			.setAuthor(newMessage.author.tag, newMessage.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.warn);

		// If the oldMessage is a partial message but was sent in a guild, log the update of an uncached message
		if (oldMessage.partial && oldMessage.guild) {
			logEmbed.setDescription(`**Uncached message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			// Use modules.charLimit() to ensure the embed field does not exceed Discord's <EmbedField> character limit
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`ID: ${newMessage.id} | ${await dateTimeGroup()}`);
		}

		// Otherwise, if the oldMessage was sent in a guild and is not a partial, attempt to fully log its update
		else if (newMessage.guild) {
			// If the <Message.content> has not changed, or if the <Message.author> is a bot, cease further execution
			if (oldMessage.content === newMessage.content || newMessage.author.bot) return;

			// Update the log embed to fully log the <Message> update
			logEmbed.setDescription(`**Message edited in ${newMessage.channel}** [Jump to Message](${newMessage.url})`);
			logEmbed.addField('Before', charLimit(oldMessage.content, 1024));
			logEmbed.addField('After', charLimit(newMessage.content, 1024));
			logEmbed.setFooter(`Author: ${newMessage.author.id} | Message: ${newMessage.id} | ${await dateTimeGroup()}`);
		}

		// If the <Message> was not sent in a guild, cease further execution
		else return;

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });
	},
};