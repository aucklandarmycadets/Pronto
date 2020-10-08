const { ids: { adjPlus }, emojis: { errorEmoji }, colours } = require('../config');
const { cmds: { help, purge } } = require('../cmds');
const { cmdError, debugError, embedScaffold } = require('../modules');

module.exports = {
	name: purge.cmd,
	description: purge.desc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const memberRoles = msg.member.roles.cache;
		const userMentions = msg.mentions.users;

		if (!memberRoles.some(roles => adjPlus.includes(roles.id))) {
			bot.commands.get(help.cmd).execute(msg, args);
			return;
		}

		if (args.length === 0) {
			cmdError(msg, 'Insufficient arguments.', purge.error);
			return;
		}

		else if (userMentions.size > 1) {
			cmdError(msg, 'You cannot purge multiple users simultaneously.', purge.error);
			return;
		}


		else if (args.length > 2) {
			cmdError(msg, 'Too many arguments.', purge.error);
			return;
		}

		const user = userMentions.first();
		const purgeCount = Number(args[0]) ? Number(args[0]) : Number(args[1]);

		if (!purgeCount && !user) {
			cmdError(msg, 'Invalid input.', purge.error);
		}

		else if (!purgeCount) {
			cmdError(msg, 'You must specify an amount of messages to delete.', purge.error);
		}

		if (purgeCount > 100) {
			cmdError(msg, 'You cannot purge more than 100 messages at a time.', purge.error);
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

							embedScaffold(msg.channel, `${msg.author} Error purging ${purgeCount} messages.`, colours.error, 'msg');
							debugError(error, `Error purging ${purgeCount} messages in ${msg.channel}.`);
						});
				});
		}
	},
};