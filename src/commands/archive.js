'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { Lesson } = require('../models');
const { dateTimeGroup } = require('../modules');
const { commandError, debugError, embedScaffold, errorReact, findGuildConfiguration, sendMsg, successReact } = require('../handlers');

/**
 * @member {commands.Command} commands.archive Archive a \<TextChannel> by restricting channel visibility and moving it to a designated channel category
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { ids: { logId, archivedId }, commands: { archive }, colours } = await findGuildConfiguration(guild);

	/**
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	archive.execute = ({ msg }) => {
		const { bot } = require('../pronto');

		// Extract the first mentioned channel
		const channel = msg.mentions.channels.first();

		try {
			// Ensure there was at least one <GuildChannel> mentioned
			if (msg.mentions.channels.size === 0) throw 'You must specify a text channel.';

			// Ensure <GuildChannel> is of type <TextChannel> or <NewsChannel>
			else if (msg.mentions.channels.some(mention => mention.type !== 'text' && mention.type !== 'news')) throw 'You can only archive text channels.';

			// Ensure there was only one channel mentioned
			else if (msg.mentions.channels.size > 1) throw 'You must archive channels individually.';

			// Ensure channel is not already archived
			else if (bot.channels.cache.get(channel.id).parentId === archivedId) throw 'Channel is already archived.';
		}

		catch (thrownError) { return commandError(msg, thrownError, archive.error); }

		// Delete database document when archiving a lesson channel
		Lesson.findOneAndDelete({ lessonId: msg.channel.id }).exec()
			.catch(error => console.error(error));

		// Move channel to archive category
		channel.setParent(archivedId, { lockPermissions: true })
			.then(async () => {
				// Success react to command message
				successReact(msg);

				// Create archive embed
				const archiveEmbed = new Discord.MessageEmbed()
					.setTitle('Channel Archived 🔒')
					.setColor(colours.error)
					.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
					.setFooter(await dateTimeGroup(guild));

				// Send archive embed
				sendMsg(channel, { embeds: [archiveEmbed] });

				// Create log embed
				const logEmbed = new Discord.MessageEmbed()
					.setColor(colours.warn)
					.setAuthor(msg.author.tag, msg.author.displayAvatarURL({ dynamic: true }))
					.setDescription(`**Channel ${channel} archived by ${msg.author}**`)
					.setFooter(`User: ${msg.author.id} | Channel: ${channel.id} | ${await dateTimeGroup(guild)}`);

				// Get the guild's log channel and send the log embed
				const logChannel = bot.channels.cache.get(logId);
				sendMsg(logChannel, { embeds: [logEmbed] });
			})
			.catch(error => {
				// If error, react with error and send error messages
				errorReact(msg);
				embedScaffold(guild, msg.channel, `${msg.author} Error archiving ${channel}.`, colours.error, 'MESSAGE');
				debugError(guild, error, `Error archiving ${channel}.`);
			});
	};

	return archive;
};