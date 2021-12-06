'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { ids: { DEVELOPER_ID } } = require('../config');
const { deleteMsg, directCommandError, embedScaffold, errorReact, formatList, getRoleError, prefixCommand, sendDirect, sendMsg, successReact } = require('../modules');
const { permissionsHandler } = require('../handlers');

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @module commands/help
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { settings: { prontoLogo }, commands: { help, ...commands }, colours } = await require('../handlers/database')(guild);

	/**
	 * Send details and assistance about a specific command, or generate a list of available commands when needed
	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	help.execute = async ({ msg, args }) => {
		const { bot } = require('../pronto');

		// Ensure that the member's common guild is not currently suffering an outage
		if (!msg.guild && !guild.available) {
			errorReact(msg);
			return embedScaffold(guild, msg.author, 'There was an error reaching the server, please try again later.', colours.error, 'DIRECT');
		}

		// Get the member's roles, which may require fetching if command was sent in DM
		const memberRoles = (msg.guild)
			? msg.member.roles.cache
			: await guild.members.fetch(msg.author.id).then(member => member.roles.cache);

		// Return if there was an issue retrieving the member's roles
		if (!memberRoles) return getRoleError(msg);

		// If the command message was sent in a guild, delete it
		if (msg.guild) deleteMsg(msg);

		// Parse the argument command if it exists
		const argCommand = args[0]
			? args[0].toLowerCase()
			: null;

		// Attempt to read the parsed argument command and find the <Command>
		const command = bot.commands.get(argCommand) || bot.commands.find(_command => _command.aliases && _command.aliases.includes(_command));

		// Initialise blank help embed
		const helpEmbed = new Discord.MessageEmbed();

		(command)
			// If the <Command> has been found, ensure the member has the necessary permissions for the <Command>
			? (await permissionsHandler(msg, command))
				// If so, send the help embed for the <Command>
				? sendHelpEmbed()
				: (msg.guild)
					// Otherwise, send a list of usable commands if help command message was in a guild
					? sendCommandList()
					// If the help command message was in a DM, reply with an invalid permission error message
					: directCommandError(msg, 'NO_PERMISSION')
			// If a <Command> was not recognised, send the list of usable commands
			: sendCommandList();

		/**
		 * Send a help embed for the specified \<Command> back to the user
		 */
		async function sendHelpEmbed() {
			// Set the appropriate title for the help embed
			helpEmbed.setTitle(`Command: ${await prefixCommand(command, guild)}`);
			helpEmbed.setColor(colours.primary);
			// Set the embed description to the help text for the identified <Command>
			helpEmbed.setDescription(command.help);

			// If the help command message was sent in a guild, add a footer identifying the message author and send it into the same channel
			if (msg.guild) {
				helpEmbed.setFooter(`Requested by ${msg.member.displayName}`, msg.author.displayAvatarURL({ dynamic: true }));
				return sendMsg(msg.channel, { embeds: [helpEmbed] });
			}

			// Ensure the help embed does not include any role mention before sending it into a direct message channel
			// This is because mentioned <Role> tags render as '@deleted-role' when sent in a non-<GuildChannel>
			else if (!helpEmbed.description.includes('<@&')) {
				successReact(msg);
				return sendDirect(msg.author, { embeds: [helpEmbed] }, msg.channel);
			}

			// If there are role mentions, send an appropriate error message
			else return directCommandError(msg, 'HAS_ROLE_MENTION');
		}

		/**
		 * Send a list of all the commands the user is permitted to use
		 */
		async function sendCommandList() {
			// Initialise the list (stored as a [key, value] object) of commands with the unqualified and qualified descriptions of the help <BaseCommand>
			// i.e. unqualified help (no argument command) and qualified help (specified argument command)
			const commandsList = {
				[await prefixCommand(help, guild)]: help.description.unqualified,
				[`${await prefixCommand(help, guild)} [command]`]: help.description.qualified,
			};

			// Iterate through each remaining <BaseCommand>
			for (const guildCommand of Object.values(commands)) {
				// Check whether the member has the necessary permissions for the <BaseCommand> and if it should be displayed in the commands list
				// If so, create a new [key, value] entry in the commandsList object
				if (await permissionsHandler(msg, guildCommand) && guildCommand.displayInList) commandsList[`${await prefixCommand(guildCommand, guild)}`] = guildCommand.description.general;
			}

			// If the original help command message was not deleted, react with the appropriate emoji, depending on whether an argument command was included or not
			if (!msg.guild && argCommand) errorReact(msg);
			else if (!msg.guild) successReact(msg);

			// Fetch James' <User> to include in the bot's footer
			const James = await bot.users.fetch('192181901065322496');

			// Fill out the help embed
			helpEmbed.setTitle('Commands List');
			helpEmbed.setThumbnail(prontoLogo);
			helpEmbed.setColor(colours.primary);
			// Format the commandsList object using modules.formatList()
			helpEmbed.setDescription(formatList(commandsList, true));
			// Add developer information to embed footer
			helpEmbed.setFooter(`Developed by ${James.tag}`, James.avatarURL({ dynamic: true }));

			// Add field for all users apart from the developer to indicate that some commands may not be shown
			if (msg.author.id !== DEVELOPER_ID) helpEmbed.addField('Note', `Only displaying commands available to **${(msg.guild) ? msg.member.displayName : msg.author}**.`);

			// Send the commands list embed to the user in DMs
			sendDirect(msg.author, { embeds: [helpEmbed] }, msg.channel);
		}
	};

	return help;
};