'use strict';

const { colours } = require('../config');
const { jsCodeBlock } = require('../modules');
const { embedScaffold } = require('../handlers');

module.exports = (user, options, guildChannel, toDebug) => {
	// Send message to user
	return user.send(options)
		.catch(error => {
			const support = '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)';

			console.error(error);

			// Send correct error message depending on intended user
			if (toDebug) embedScaffold(null, null, `Error sending direct message to ${user}.`, colours.error, 'DEBUG', 'More Information', support, jsCodeBlock(error.stack));
			else embedScaffold(null, guildChannel, `${user} I can't send direct messages to you!`, colours.error, 'MESSAGE', 'More Information', support);
		});
};