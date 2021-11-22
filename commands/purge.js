'use strict';

const { cmdError, debugError, embedScaffold, errorReact } = require('../modules');

module.exports = async guild => {
	const { cmds: { purge }, colours } = await require('../handlers/database')(guild);

	purge.execute = (msg, args) => {
		const userMentions = msg.mentions.users;

		let user, purgeCount;

		try {
			if (args.length === 0) throw 'Insufficient arguments.';

			else if (userMentions.size > 1) throw 'You cannot purge multiple users simultaneously.';

			else if (args.length > 2) throw 'Too many arguments.';

			user = userMentions.first();
			purgeCount = Number(args[0]) || Number(args[1]);

			if (!purgeCount && !user) throw 'Invalid input.';

			else if (!purgeCount) throw 'You must specify an amount of messages to delete.';

			if (purgeCount > 100) throw 'You cannot purge more than 100 messages at a time.';
		}

		catch (error) { return cmdError(msg, error, purge.error); }

		let msgs = [];
		let before = msg.id;

		while (msgs.length !== purgeCount) {
			await msg.channel.messages.fetch({ limit: 100, before })
				.then(_msgs => {
					msgs = (userToPurge)
						? msgs.concat(_msgs.filter(_msg => _msg.author.id === userToPurge.id).array().slice(0, purgeCount - msgs.length))
						: msgs.concat(_msgs.array().slice(0, purgeCount - msgs.length));

					before = _msgs.last().id;
				})
				.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));
		}

		msg.channel.bulkDelete(msgs)
			.catch(error => {
				errorReact(msg);
				embedScaffold(guild, msg.channel, `${msg.author} Error purging ${purgeCount} messages.`, colours.error, 'MESSAGE');
				debugError(error, `Error purging ${purgeCount} messages in ${msg.channel}.`);
			});
	};

	return purge;
};