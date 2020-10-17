const { cmds: { evaluate } } = require('../cmds');
const { sendMsg, debugError } = require('../modules');

module.exports = evaluate;
module.exports.execute = (msg, args) => {
	'use strict';

	const { bot } = require('../pronto');
	const code = args.join(' ');

	try {
		let evaled = eval(code);

		if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

		sendMsg(msg.channel, `\`\`\`js\n${evaled}\`\`\``);
	}

	catch (error) { debugError(error, `Error evaluating \`${code}\``); }
};