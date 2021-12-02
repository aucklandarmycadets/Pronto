'use strict';

const Discord = require('discord.js');
const fs = require('fs');

const { charLimit, debugError, deleteMsg, dateTimeGroup, sendMsg, stripID } = require('../modules');

module.exports = {
	bot: ['messageDelete'],
	process: [],
	/**
	 * Event handler to log whenever a \<Message> is deleted
	 * @param {'messageDelete'} _ The event that was emitted
	 * @param {Discord.Message} msg The deleted message
	 */
	async handler(_, msg) {
		const { bot } = require('../pronto');
		const { settings: { prefix }, ids: { logID }, cmds: { purge }, colours } = await require('../handlers/database')(msg.guild);

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
			// Call autoDeletingCmd() to check if the deleted <Message> was a command message for an auto-deleting command
			// If it was, do not log its deletion and cease further execution
			if (autoDeletingCmd()) return;

			// Attempt to extract the deleted <Message> content, which may be an element of a <MessageEmbed>
			let content = (!msg.content)
				// If the <Message>.content field is empty, check if the <Message> had an embed
				? (msg.embeds[0])
					// If it did have an embed, check if the <MessageEmbed> had a description
					? (msg.embeds[0].description)
						// If the <MessageEmbed>.description is not empty, store it as the deleted message's content
						? msg.embeds[0].description
						// Otherwise, if the <MessageEmbed>.description is empty, check if the <MessageEmbed> has a title
						: (msg.embeds[0].title)
							// If there is a title, store it as the message's content
							? msg.embeds[0].title
							// Otherwise, store the deleted message's content as 'Message Embed'
							: 'Message Embed'
					// Otherwise, if the <Message>.content is empty and there is no <MessageEmbed>, store the message's content as 'No message content'
					: 'No message content'
				// Otherwise, if the <Message>.content is not empty, store it as the message's content
				: msg.content;

			// Use modules.charLimit() to ensure the message's content does not exceed Discord's <MessageEmbed>.description character limit
			content = charLimit(`>>> ${content}`, 2048);

			// Extract the <MessageAttachment> from the deleted message if it exists
			const attachment = (msg.attachments)
				? msg.attachments.first()
				: null;

			// Set the log embed's author and footer fields, and preliminarily set the embed's description
			logEmbed.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }));
			logEmbed.setDescription(`**Message sent by ${msg.author} deleted in ${msg.channel}**\n${content}`);
			logEmbed.setFooter(`Author: ${msg.author.id} | Message: ${msg.id} | ${await dateTimeGroup()}`);

			// If there was a <MessageAttachment>, add a field to the log embed to include the attachment's name
			if (attachment) logEmbed.addField('Attachment', Discord.escapeMarkdown(attachment.name));

			if (msg.channel.lastMessage) {
				// If the message's <TextChannel> was not completely emptied, check if the last <Message> was a commands\purge.js command
				if (msg.channel.lastMessage.content.includes(purge.cmd) || purge.aliases.some(alias => msg.channel.lastMessage.content.includes(alias))) {
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

				// If the audit log target matches the <Message>.author, edit the log embed description to include the executor's tag
				if (target.id === msg.author.id) logEmbed.setDescription(`**Message sent by ${msg.author} deleted by ${executor} in ${msg.channel}**\n${content}`);
			}
		}

		// If the <Message> was not sent in a guild, cease further execution
		else return;

		// Get the guild's log channel and send the log embed
		const logChannel = bot.channels.cache.get(logID);
		sendMsg(logChannel, { embeds: [logEmbed] });

		/**
		 * Check whether a deleted \<Message> was deleted due to the execution of an auto-deleting command
		 * @returns {boolean} Whether the deleted message is a command message that is auto-deleted by the bot upon command execution
		 */
		function autoDeletingCmd() {
			// Use Promise.all() to ensure all command objects have been loaded before proceeding
			const autoDeletingCmds = Promise.all(
				fs.readdirSync('./commands/')
					// Read the file names of all the Javascript command files inside ./commands, other than the index file
					.filter(file => file.endsWith('.js') && file !== 'index.js')
					// Read the file contents of each command file, and filter the string[] to the names of only the files which reference modules.deleteMsg()
					.filter(file => fs.readFileSync(`./commands/${file}`, { encoding: 'utf-8', flag: 'r' }).includes('deleteMsg'))
					// Load each command by passing the guild into each command file's exported function
					.map(async file => await require(`../commands/${file}`)(msg.guild)),
			);

			// Parse the arguments from the message, by splitting the string at the space characters
			const args = msg.content.split(/ +/);

			// Check if the command was executed with the guild's command prefix
			const usesPrefix = msg.content.toLowerCase().startsWith(prefix.toLowerCase());
			// Check if the command was executed by mentioning the bot user in place of a prefix
			const usesBotMention = stripID(args[0]) === bot.user.id;

			// If the message does not begin with either the guild's command prefix or the bot's mention followed by a command, return false
			if (!usesPrefix && (!usesBotMention || args.length === 1)) return false;

			// Parse the message command
			const msgCmd = (usesBotMention)
				// If the message command mentions the bot, remove the first two elements of the message arguments, and extract the 2nd substring in lowercase
				? args.splice(0, 2)[1].toLowerCase()
				// If the command message uses the guild's command prefix, remove the first element and remove the prefix from the substring
				: args.shift().toLowerCase().replace(prefix.toLowerCase(), '');

			// Check whether the parsed message command matches to a command file that references modules.deleteMsg(), and return the boolean result
			return autoDeletingCmds.some(cmd => cmd.cmd === msgCmd || cmd.aliases.includes(msgCmd));
		}
	},
};