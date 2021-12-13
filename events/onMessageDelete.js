'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const fs = require('fs');

const { charLimit, dateTimeGroup, extractID } = require('../modules');
const { debugError, deleteMsg, findGuildConfiguration, sendMsg } = require('../handlers');

/**
 * @member {events.EventModule} events.onMessageDelete Event handler to log whenever a \<Message> is deleted
 */

/**
 * @type {Typings.EventModule}
 */
module.exports = {
	bot: ['messageDelete'],
	process: [],
	/**
	 * @param {'messageDelete'} _ The event that was emitted
	 * @param {Discord.Message} msg The deleted message
	 */
	async handler(_, msg) {
		const { bot } = require('../pronto');
		const { settings: { prefix }, ids: { logID }, commands: { purge }, colours } = await findGuildConfiguration(msg.guild);

		// Initialise log embed
		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error);

		// If the deleted <Message> is a partial message but was sent in a guild, log the deletion of an uncached message
		if (msg.partial && msg.guild) {
			logEmbed.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }));
			logEmbed.setDescription(`**Uncached message deleted in ${msg.channel}**`);
			logEmbed.setFooter(`ID: ${msg.id} | ${await dateTimeGroup()}`);
		}

		// Otherwise, if the deleted <Message> was sent in a guild and is not a partial, attempt to fully log its deletion
		else if (msg.guild) {
			// Call autoDeletingCommand() to check if the deleted <Message> was a command message for an auto-deleting <Command>
			// If it was, do not log its deletion and cease further execution
			if (autoDeletingCommand()) return;

			// Attempt to extract the deleted <Message> content, which may be an element of a <MessageEmbed>
			const content = (!msg.content)
				// If the <Message.content> field is empty, check if the <Message> had an embed
				? (msg.embeds[0])
					// If it did have an embed, check if the <MessageEmbed> had a description
					? (msg.embeds[0].description)
						// If the <MessageEmbed.description> is not empty, store it as the deleted message's content
						? msg.embeds[0].description
						// Otherwise, if the <MessageEmbed.description> is empty, check if the <MessageEmbed> has a title
						: (msg.embeds[0].title)
							// If there is a title, store it as the message's content
							? msg.embeds[0].title
							// Otherwise, store the deleted message's content as 'Message Embed'
							: 'Message Embed'
					// Otherwise, if the <Message.content> is empty and there is no <MessageEmbed>, store the message's content as 'No message content'
					: 'No message content'
				// Otherwise, if the <Message.content> is not empty, store it as the message's content
				: msg.content;

			// Extract the <MessageAttachment> from the deleted message if it exists
			const attachment = (msg.attachments)
				? msg.attachments.first()
				: null;

			// Set the log embed's author and footer fields, and preliminarily set the embed's description
			logEmbed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
			// Use modules.charLimit() to ensure the message's content does not exceed Discord's <MessageEmbed.description> character limit
			logEmbed.setDescription(charLimit(`**Message sent by ${msg.author} deleted in ${msg.channel}**\n>>> ${content}`, 'EMBED_DESCRIPTION'));
			logEmbed.setFooter(`Author: ${msg.author.id} | Message: ${msg.id} | ${await dateTimeGroup()}`);

			// If there was a <MessageAttachment>, add a field to the log embed to include the attachment's name
			if (attachment) logEmbed.addField('Attachment', Discord.escapeMarkdown(attachment.name));

			if (msg.channel.lastMessage) {
				// If the message's <TextChannel> was not completely emptied, check if the last <Message> was a commands\purge.js <Command>
				if (msg.channel.lastMessage.content.includes(purge.command) || purge.aliases.some(alias => msg.channel.lastMessage.content.includes(alias))) {
					// If it was, delete the command message
					deleteMsg(msg.channel.lastMessage);
					// Add additional context to the log embed on the command author
					logEmbed.setDescription(`**Message sent by ${msg.author} deleted by ${msg.channel.lastMessage.author} in ${msg.channel}**\n${content}`);
				}
			}

			// Fetch the guild's audit logs for a deleted message
			const fetchedLogs = await msg.guild.fetchAuditLogs({ limit: 1, type: 'MESSAGE_DELETE' })
				.catch(error => debugError(error, 'Error fetching audit logs.'));

			if (fetchedLogs) {
				// If the audit logs were successfully fetched, extract the executor and target from the message deletion audit entry
				const { executor, target } = fetchedLogs.entries.first();

				// If the audit log target matches the <Message.author>, edit the log embed description to include the executor's tag
				if (target.id === msg.author.id) logEmbed.setDescription(`**Message sent by ${msg.author} deleted by ${executor} in ${msg.channel}**\n${content}`);
			}
		}

		// If the <Message> was not sent in a guild, cease further execution
		else return;

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });

		/**
		 * Check whether a deleted \<Message> was deleted due to the execution of an auto-deleting \<Command>
		 * @returns {boolean} Whether the deleted message is a command message that is auto-deleted by the bot upon \<Command> execution
		 */
		function autoDeletingCommand() {
			// Use Promise.all() to ensure all <Command> objects have been loaded before proceeding
			const autoDeletingCommands = Promise.all(
				fs.readdirSync('./commands/')
					// Read the file names of all the JavaScript command files inside ./commands, other than the index and <BaseCommand> schematic files
					.filter(file => file.endsWith('.js') && !['index.js', 'commands.js'].includes(file))
					// Read the file contents of each <Command> file, and filter the string[] to the names of only the files which reference handlers.deleteMsg()
					.filter(file => fs.readFileSync(`./commands/${file}`, { encoding: 'utf-8', flag: 'r' }).includes('deleteMsg'))
					// Load each <Command> by passing the guild into each command file's exported function
					.map(async file => await require(`../commands/${file}`)(msg.guild)),
			);

			// Parse the arguments from the message, by splitting the string at the space characters
			const args = msg.content.split(/ +/);

			// Check if the <Command> was executed with the guild's command prefix
			const usesPrefix = msg.content.toLowerCase().startsWith(prefix.toLowerCase());
			// Check if the <Command> was executed by mentioning the bot user in place of a prefix
			const usesBotMention = extractID(args[0]) === bot.user.id;

			// If the message does not begin with either the guild's command prefix or the bot's mention followed by a potential <CommandName>, return false
			if (!usesPrefix && (!usesBotMention || args.length === 1)) return false;

			// Parse the message command
			const msgCommand = (usesBotMention)
				// If the message command mentions the bot, remove the first two elements of the message arguments, and extract the 2nd substring in lowercase
				? args.splice(0, 2)[1].toLowerCase()
				// If the command message uses the guild's command prefix, remove the first element and remove the prefix from the substring
				: args.shift().toLowerCase().replace(prefix.toLowerCase(), '');

			// Check whether the parsed message command matches to a <Command> file that references handlers.deleteMsg(), and return the boolean result
			return autoDeletingCommands.some(command => command.command === msgCommand || command.aliases.includes(msgCommand));
		}
	},
};