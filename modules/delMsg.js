'use strict';

const { debugError } = require('./');

module.exports = msg => {
	(msg.guild)
		? msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content))
		: msg.delete().catch(error => debugError(error, 'Error deleting message in DMs'));
};