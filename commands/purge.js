'use strict';

const { colours } = require('../config');
const { cmds: { purge } } = require('../cmds');
const { cmdError, debugError, errorReact, embedScaffold } = require('../modules');

module.exports = purge;
module.exports.execute = (msg, args) => {
	const userMentions = msg.mentions.users;

	let user, purgeCount;

	try {
		if (args.length === 0) throw 'Insufficient arguments.';

		else if (userMentions.size > 1) throw 'You cannot purge multiple users simultaneously.';

		else if (args.length > 2) throw 'Too many arguments.';

		user = userMentions.first();
		purgeCount = Number(args[0])
			? Number(args[0])
			: Number(args[1]);

		if (!purgeCount && !user) throw 'Invalid input.';

		else if (!purgeCount) throw 'You must specify an amount of messages to delete.';

		if (purgeCount > 100) throw 'You cannot purge more than 100 messages at a time.';
	}

	catch (error) { return cmdError(msg, error, purge.error); }

	msg.channel.messages.fetch({ limit: 100, before: msg.id })
		.then(messages => {
			if (user) {
				const filterBy = user.id;
				messages = messages.filter(message => message.author.id === filterBy).array().slice(0, purgeCount);
			}

			else {
				messages = messages.array().slice(0, purgeCount);
			}

			msg.channel.bulkDelete(messages)
				.catch(error => {
					errorReact(msg);
					embedScaffold(msg.channel, `${msg.author} Error purging ${purgeCount} messages.`, colours.error, 'msg');
					debugError(error, `Error purging ${purgeCount} messages in ${msg.channel}.`);
				});
		})
		.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));
};
