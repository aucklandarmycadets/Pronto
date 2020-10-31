'use strict';

const { successReact } = require('../modules');

module.exports = async guild => {
	const { cmds: { restart } } = await require('../handlers/database')(guild);

	restart.execute = msg => {
		successReact(msg);
		process.emit('SIGINT');
	};

	return restart;
};