'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { commandError, debugError, embedScaffold, errorReact, findGuildConfiguration } = require('../handlers');

/**
 * @member {commands.Command} commands.purge
 */

/**
 * Complete the \<Command> object from a \<BaseCommand>
 * @param {Discord.Guild} guild The \<Guild> that the member shares with the bot
 * @returns {Promise<Typings.Command>} The complete \<Command> object with a \<Command.execute()> method
 */
module.exports = async guild => {
	const { commands: { purge }, colours } = await findGuildConfiguration(guild);

	/**
	 * Bulk delete a specified number of messages from a \<TextChannel>

	 * @param {Typings.CommandParameters} parameters The \<CommandParameters> to execute this command
	 */
	purge.execute = async ({ msg, args }) => {
		// Parse the number of messages to purge from the command arguments
		const purgeCount = Number(args[0]) || Number(args[1]);
		// Extract the first mentioned <GuildMember>, assuming it exists
		const userToPurge = msg.mentions.users.first();

		try {
			// Ensure the command arguments are not empty
			if (args.length === 0) throw 'Insufficient arguments.';

			// Ensure there was only one or less <GuildMember> mentioned
			else if (msg.mentions.users.size > 1) throw 'You cannot purge multiple users simultaneously.';

			// Ensure there are not more than two command arguments
			else if (args.length > 2) throw 'Too many arguments.';

			// Error message for if neither a valid purgeCount nor a mentioned member
			else if (!purgeCount && !userToPurge) throw 'Invalid input.';

			// Ensure a valid purgeCount was parsed
			else if (!purgeCount) throw 'You must specify an amount of messages to delete.';

			// Ensure the number of messages to purge does not exceed the Discord API limit of 100 messages
			else if (purgeCount > 100) throw 'You cannot purge more than 100 messages at a time.';
		}

		catch (thrownError) { return commandError(msg, thrownError, purge.error); }

		// Initialise values for the <Message.id[]> and before to ensure purgeCount messages are actually fetched and filtered
		/** @type {Discord.Snowflake[]} */
		let msgs = [];
		let before = msg.id;

		// Loop through until purgeCount messages are added to the msgs <Snowflake[]>
		while (msgs.length !== purgeCount) {
			// Fetch messages in blocks of 100 (maximum allowed by the API) moving back in time
			await msg.channel.messages.fetch({ limit: 100, before })
				.then(_msgs => {
					// Filter the fetched messages by user (if specified), and convert the <Collection> to a <Snowflake[]> of each <Message.id>
					msgs = (userToPurge)
						? [...msgs, ..._msgs.filter(_msg => _msg.author.id === userToPurge.id).keys()]
						: [...msgs, ..._msgs.keys()];

					// Slice the resultant <Snowflake[]> to the appropriate length
					msgs = msgs.slice(0, purgeCount - msgs.length);

					// Update oldest message Id
					before = _msgs.last().id;
				})
				.catch(error => debugError(guild, error, `Error fetching messages in ${msg.channel}.`));
		}

		// Once all the messages to purge have been fetched, call the <TextChannel.bulkDelete()> method
		msg.channel.bulkDelete(msgs)
			.catch(error => {
			// If error, react with error and send error messages
				errorReact(msg);
				embedScaffold(guild, msg.channel, `${msg.author} Error purging ${purgeCount} messages.`, colours.error, 'MESSAGE');
				debugError(guild, error, `Error purging ${purgeCount} messages in ${msg.channel}.`);
			});

		// handlers.deleteMsg() is called on the command message by <Client>#messageDeleteBulk
	};

	return purge;
};