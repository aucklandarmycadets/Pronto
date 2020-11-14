'use strict';

const { ids: { devID } } = require('../config');

module.exports = (memberRoles, id, cmd) => {
	const hasDisallowedRoles = cmd.noRoles.length && memberRoles.some(roles => cmd.noRoles.includes(roles.id));
	const hasAllowedRoles = cmd.roles.length && memberRoles.some(roles => cmd.roles.includes(roles.id));
	const isDev = cmd.devOnly && id === devID;

	return (!hasDisallowedRoles || hasAllowedRoles || isDev)
		? true
		: false;
};