'use strict';

module.exports = (dest, msg, chnl, debug) => {
	const { embedScaffold, js } = require('./');
	const { colours } = require('../config');

	return dest.send(msg)
		.catch(error => {
			const support = '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)';

			console.error(error);

			if (debug) embedScaffold(null, `Error sending direct message to ${dest}.`, colours.error, 'debug', 'More Information', support, js(error.stack));
			else embedScaffold(chnl, `${dest} I can't send direct messages to you!`, colours.error, 'msg', 'More Information', support);
		});
};