'use strict';

const { ids: { devID } } = require('../config');

module.exports = (memberRoles, id, cmd) => {
	return ((cmd.noRoles.length && !memberRoles.some(roles => cmd.noRoles.includes(roles.id)))
	|| (cmd.roles.length && memberRoles.some(roles => cmd.roles.includes(roles.id)))
	|| (cmd.devOnly && id === devID))
		? true
		: false;
};