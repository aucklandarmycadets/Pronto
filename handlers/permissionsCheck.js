'use strict';

const { ids: { devID } } = require('../config');

module.exports = (memberRoles, id, cmd) => {
	const hasDeniedRoles = memberRoles.some(roles => cmd.noRoles.includes(roles.id));
	const hasRequiredRoles = memberRoles.some(roles => cmd.roles.includes(roles.id));

	const isDeveloper = id === devID;
	const onlyDeniedRolesDefined = cmd.noRoles.length && !cmd.roles.length;

	return (isDeveloper || (!cmd.devOnly && !hasDeniedRoles && (onlyDeniedRolesDefined || hasRequiredRoles)));
};