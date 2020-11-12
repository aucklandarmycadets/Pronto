/* eslint-disable no-unused-vars */
'use strict';

const Discord = require('discord.js');
const { cmdError, delMsg, dtg, js, sendMsg, ...modules } = require('../modules');
const handlers = require('../handlers');

module.exports = async guild => {
	const { cmds: { evaluate, ...cmds }, colours, _doc: config, ...db } = await require('../handlers/database')(guild);
	const database = await require('../handlers/database');

	evaluate.execute = async (msg, args) => {
		const { bot } = require('../pronto');

		const codeBlock = (args.includes('-nocode') || args.includes('-nc'))
			? false
			: true;

		const silent = (args.includes('-silent') || args.includes('-s'))
			? true
			: false;

		if (args.includes('-delete') || args.includes('-del')) delMsg(msg);

		args = args.filter(arg => !arg.startsWith('-'));

		if (args.length === 0) return cmdError(msg, 'You must enter something to evaluate.', evaluate.error);

		const code = args.join(' ');

		try {
			const embed = new Discord.MessageEmbed();

			let evaled = await eval(code);

			if (silent) return;

			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

			(code.includes('embed.'))
				? sendMsg(msg.channel, embed)
				: msgSplit(evaled, '},');
		}

		catch (error) { msgSplit(error.stack, ')'); }

		function msgSplit(str, char) {
			const lim = Math.ceil(str.length / 1985);

			for (let i = 0; i < lim; i++) {
				const breakAt = (str.length > 1985)
					? (str.lastIndexOf(char, 1985) !== -1)
						? str.lastIndexOf(char, 1985) + char.length
						: (str.lastIndexOf(' ', 1985) !== -1)
							? str.lastIndexOf(' ', 1985) + 1
							: 1985
					: 1985;

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