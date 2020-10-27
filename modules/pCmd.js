'use strict';

module.exports = async (cmd, guild) => {
	const { config: { prefix } } = await require('../handlers/database')(guild);
	return `${prefix}${cmd.cmd}`;
};