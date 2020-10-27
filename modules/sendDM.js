'use strict';

module.exports = (dest, msg, debug) => {
	const { embedScaffold, js } = require('./');
	const { colours } = require('../config');

	return dest.send(msg)
		.catch(error => {
			const member = msg.mentions.members.first();
			const support = '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)';

			console.error(error);

			if (debug) embedScaffold(null, `Error sending direct message to ${member}.`, colours.error, 'debug', 'More Information', support, js(error.stack));
			else embedScaffold(msg.channel, `${msg.author} I can't send direct messages to you!`, colours.error, 'msg', 'More Information', support);
		});
};