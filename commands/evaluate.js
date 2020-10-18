const { cmds: { evaluate } } = require('../cmds');
const { sendMsg, cmdError, debugError } = require('../modules');

module.exports = evaluate;
module.exports.execute = (msg, args) => {
	'use strict';

	const { bot } = require('../pronto');
	
	if (args.length === 0) return cmdError(msg, 'You must enter something to evaluate.', evaluate.error);

	const code = args.join(' ');

	try {
		let evaled = eval(code);

		if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

		sendMsg(msg.channel, `\`\`\`js\n${evaled}\`\`\``);
	}

	catch (error) { debugError(error, `Error evaluating \`${code}\``); }
};