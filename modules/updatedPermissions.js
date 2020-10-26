'use strict';

module.exports = (oldState, newState) => {
	const oldPerms = oldState.permissions.toArray();
	const newPerms = newState.permissions.toArray();

	const changedPerms = [ ...oldPerms.filter(value => newPerms.indexOf(value) === -1),
		...newPerms.filter(value => oldPerms.indexOf(value) === -1) ];

	return changedPerms;
};