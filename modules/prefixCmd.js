'use strict';

module.exports = async (cmd, guild) => {
	const { settings: { prefix } } = await require('../handlers/database')(guild);
	return `${prefix}${cmd.cmd}`;
};