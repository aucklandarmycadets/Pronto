'use strict';

module.exports = (destination, options) => {
	const { debugError } = require('./');
	return destination.send(options).catch(error => debugError(error, `Error sending message to ${destination}.`));
};