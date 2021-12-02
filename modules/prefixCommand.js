'use strict';

module.exports = async (command, guild) => {
	const { settings: { prefix } } = await require('../handlers/database')(guild);
	return `${prefix}${command.command}`;
};