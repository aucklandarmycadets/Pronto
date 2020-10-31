'use strict';

const { ids: { devID } } = require('../config');

module.exports = (memberRoles, id, cmd) => {
	if ((cmd.noRoles.length && !memberRoles.some(roles => cmd.noRoles.includes(roles.id)))
	|| (cmd.roles.length && memberRoles.some(roles => cmd.roles.includes(roles.id)))
	|| (cmd.devOnly && id === devID)) {
		return true;
	}

	return false;
};