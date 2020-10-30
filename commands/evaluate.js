'use strict';

const Discord = require('discord.js');
const { cmdError, dtg, js, sendMsg, ...modules } = require('../modules');
const handlers = require('../handlers');

module.exports = async guild => {
	const { cmds: { evaluate, ...cmds }, ...cmdsList } = await require('../cmds')(guild);
	const { colours, _doc: config, ...db } = await require('../handlers/database')(guild);

	evaluate.execute = async (msg, args) => {
		const { bot } = require('../pronto');

		const codeBlock = (args.includes('-nocode'))
			? false
			: true;

		const silent = (args.includes('-silent'))
			? true
			: false;

		args = args.filter(arg => !arg.startsWith('-'));

		if (args.length === 0) return cmdError(msg, 'You must enter something to evaluate.', evaluate.error);

		const code = args.join(' ');

		try {
			const embed = new Discord.MessageEmbed();

			let evaled = await eval(code);

			if (silent) return;

			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

			(code.includes('embed'))
				? sendMsg(msg.channel, embed)
				: msgSplit(evaled, '},');
		}

		catch (error) { msgSplit(error.stack, ')'); }

		function msgSplit(str, char) {
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
						? sendMsg(msg.channel, js(str.slice(0, breakAt)))
						: sendMsg(msg.channel, str.slice(0, breakAt))
					: null;

				str = str.slice(breakAt, str.length);
			}
		}
	};

	return evaluate;
};