'use strict';

module.exports = (dest, msg) => {
	const { debugError } = require('./');

	return dest.send(msg).catch(error => debugError(error, `Error sending message to ${dest}.`));
};