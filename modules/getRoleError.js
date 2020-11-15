'use strict';

module.exports = async msg => {
	const { embedScaffold, errorReact } = require('./');
	const { colours } = await require('../handlers/database')(msg.guild);

	errorReact(msg);

	const verifyErr = 'There was an error verifying permissions, please try again later.';

	(msg.guild)
		? embedScaffold(null, msg.channel, verifyErr, colours.error, 'msg')
		: embedScaffold(null, msg.author, verifyErr, colours.error, 'dm');

	return 'err';
};