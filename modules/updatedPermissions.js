'use strict';

module.exports = (oldState, newState) => {
	const { difference } = require('./');

	const oldPerms = oldState.permissions.toArray();
	const newPerms = newState.permissions.toArray();

	return difference(oldPerms, newPerms);
};