const modules = require('../modules');
const { cmdList: { purgeCmd, helpCmd } } = modules;
const { cmdTxt: { purgeDesc } } = modules;
const { helpObj: { errorPurge } } = modules;
const { sendErrorEmbed, debugError, embedScaffold } = modules;
const { constObj: { adjPlus, errorEmoji, error: errorRed } } = modules;

module.exports = {
	name: purgeCmd,
	description: purgeDesc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const memberRoles = msg.member.roles.cache;
		const userMentions = msg.mentions.users;

		if (!memberRoles.some(roles => adjPlus.includes(roles.id))) {
			bot.commands.get(helpCmd).execute(msg, args);
			return;
		}

		if (args.length === 0) {
			sendErrorEmbed(msg, 'Insufficient arguments.', errorPurge);
			return;
		}

		else if (userMentions.size > 1) {
			sendErrorEmbed(msg, 'You cannot purge multiple users simultaneously.', errorPurge);
			return;
		}


		else if (args.length > 2) {
			sendErrorEmbed(msg, 'Too many arguments.', errorPurge);
			return;
		}

		const user = userMentions.first();
		const purgeCount = Number(args[0]) ? Number(args[0]) : Number(args[1]);

		if (!purgeCount && !user) {
			sendErrorEmbed(msg, 'Invalid input.', errorPurge);
		}

		else if (!purgeCount) {
			sendErrorEmbed(msg, 'You must specify an amount of messages to delete.', errorPurge);
		}

		if (purgeCount > 100) {
			sendErrorEmbed(msg, 'You cannot purge more than 100 messages at a time.', errorPurge);
		}

		else {
			msg.channel.messages.fetch({ limit: 100, before: msg.id })
				.then((messages) => {
					if (user) {
						const filterBy = user ? user.id : bot.user.id;
						messages = messages.filter(message => message.author.id === filterBy).array().slice(0, purgeCount);
					}

					else {
						messages = messages.array().slice(0, purgeCount);
					}

					msg.channel.bulkDelete(messages)
						.catch(error => {
							const errorEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === errorEmoji);

							msg.react(errorEmojiObj)
								.catch(reactError => debugError(reactError, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

							embedScaffold(msg.channel, `${msg.author} Error purging ${purgeCount} messages.`, errorRed, 'msg');
							debugError(error, `Error purging ${purgeCount} messages in ${msg.channel}.`);
						});
				});
		}
	},
};