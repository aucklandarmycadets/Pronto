'use strict';

module.exports = (destination, options, channel, toDebug) => {
	const { embedScaffold, js } = require('./');
	const { colours } = require('../config');

	return destination.send(options)
		.catch(error => {
			const support = '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)';

			console.error(error);

			if (toDebug) embedScaffold(null, null, `Error sending direct message to ${destination}.`, colours.error, 'debug', 'More Information', support, js(error.stack));
			else embedScaffold(null, channel, `${destination} I can't send direct messages to you!`, colours.error, 'msg', 'More Information', support);
		});
};