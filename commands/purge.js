const modules = require('../modules');

module.exports = {
	name: modules.cmdList.purgeCmd,
	description: modules.cmdTxt.purgeDesc,
	execute(Discord, bot, msg, args) {
		'use strict';

		if (!msg.member.roles.cache.some(roles => modules.constObj.adjPlus.includes(roles.id))) {
			bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
			return;
		}

		if (args.length === 0) {
			modules.sendErrorEmbed(Discord, bot, msg, 'Insufficient arguments.', modules.helpObj.errorPurge);
			return;
		}

		else if (msg.mentions.members.size > 1) {
			modules.sendErrorEmbed(Discord, bot, msg, 'You cannot purge multiple users simultaneously.', modules.helpObj.errorPurge);
			return;
		}


		else if (args.length > 2) {
			modules.sendErrorEmbed(Discord, bot, msg, 'Too many arguments.', modules.helpObj.errorPurge);
			return;
		}

		const user = msg.mentions.users.first();
		const purgeCount = Number(args[0]) ? Number(args[0]) : Number(args[1]);

		if (!purgeCount && !user) {
			modules.sendErrorEmbed(Discord, bot, msg, 'Invalid input.', modules.helpObj.errorPurge);
		}

		else if (!purgeCount) {
			modules.sendErrorEmbed(Discord, bot, msg, 'You must specify an amount of messages to delete.', modules.helpObj.errorPurge);
		}

		if (purgeCount > 100) {
			modules.sendErrorEmbed(Discord, bot, msg, 'You cannot purge more than 100 messages at a time.', modules.helpObj.errorPurge);
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
							msg.react(msg.guild.emojis.cache.find(emoji => emoji.name === modules.constObj.errorEmoji))
								.catch(reactError => modules.debugError(Discord, bot, reactError, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

							modules.errorScaffold(Discord, bot, msg, `${msg.author} Error purging ${purgeCount} messages.`, 'msg');
							modules.debugError(Discord, bot, error, `Error purging ${purgeCount} messages in ${msg.channel}.`);
						});
				});
		}
	},
};