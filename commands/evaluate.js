const Discord = require('discord.js');

const { colours, ...config } = require('../config');
const { cmds: { evaluate, ...cmds }, ...cmdsList } = require('../cmds');
const { dtg, sendMsg, cmdError, ...modules } = require('../modules');

module.exports = evaluate;
module.exports.execute = (msg, args) => {
	'use strict';

	const { bot } = require('../pronto');

	const codeBlock = (args.includes('-nocode'))
		? false
		: true;

	args = args.filter(arg => !arg.startsWith('-'));

	if (args.length === 0) return cmdError(msg, 'You must enter something to evaluate.', evaluate.error);

	const code = args.join(' ');

	const msgSplit = (str, char) => {
		const lim = Math.ceil(str.length / 1990);

		for (let i = 0; i < lim; i++) {
			const breakAt = (str.length > 1990)
				? (str.lastIndexOf(char, 1990) !== -1)
					? str.lastIndexOf(char, 1990) + char.length
					: (str.lastIndexOf(' ', 1990) !== -1)
						? str.lastIndexOf(' ', 1990) + 1
						: 1990
				: 1990;

			(str !== 'Promise { <pending> }')
				? (codeBlock)
					? sendMsg(msg.channel, `\`\`\`js\n${str.slice(0, breakAt)}\`\`\``)
					: sendMsg(msg.channel, str.slice(0, breakAt))
				: null;

			str = str.slice(breakAt, str.length);
		}
	};

	try {
		const embed = new Discord.MessageEmbed();

		let evaled = eval(code);

		if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

		(code.includes('embed'))
			? sendMsg(msg.channel, embed)
			: msgSplit(evaled, '},');
	}

	catch (error) { msgSplit(error.stack, ')'); }
};