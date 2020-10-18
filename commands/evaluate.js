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

		const output = [evaled];
		let string = last(output);

		while (string.length > 2000) {
			const breakAt = string.lastIndexOf(',', 1990) + 1;

			output.pop();
			splitOn(string, breakAt).forEach(str => output.push(str));

			string = last(output);
		}

		output.forEach(str => sendMsg(msg.channel, `\`\`\`js\n${str}\`\`\``));
	}

	catch (error) { debugError(error, `Error evaluating \`${code}\``); }
};

const last = arr => { return arr[arr.length - 1]; };

const splitOn = (slicable, ...indices) => [0, ...indices].map((n, i, m) => slicable.slice(n, m[i + 1]));