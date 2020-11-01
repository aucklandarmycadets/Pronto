'use strict';

module.exports = (dest, msg, additions) => {
	const { debugError } = require('./');
	return dest.send(msg, additions).catch(error => debugError(error, `Error sending message to ${dest}.`));
};