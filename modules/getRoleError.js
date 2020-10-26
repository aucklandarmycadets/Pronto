'use strict';

const { colours } = require('../config');

module.exports = msg => {
	const { embedScaffold, errorReact } = require('./');

	errorReact(msg);

	const verifyErr = 'There was an error verifying permissions, please try again later.';

	(msg.guild)
		? embedScaffold(msg.channel, verifyErr, colours.error, 'msg')
		: embedScaffold(msg.author, verifyErr, colours.error, 'dm');

	return 'err';
};