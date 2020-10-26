'use strict';

const { cmds: { restart } } = require('../cmds');
const { successReact } = require('../modules');

module.exports = restart;
module.exports.execute = msg => {
	successReact(msg);
	process.emit('SIGINT');
};