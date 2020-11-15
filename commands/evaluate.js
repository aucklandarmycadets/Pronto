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

			if (code.includes('embed.')) sendMsg(msg.channel, embed);

			if (silent) return;

			if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

			evaled = removeToken(bot, evaled, code);

			msgSplit(evaled, '},');
		}

		catch (error) { msgSplit(error.stack, ')'); }

		function msgSplit(str, char) {
			while (str) {
				const breakAt = findBreakIndex(str, char);

				(codeBlock)
					? sendMsg(msg.channel, js(str.substr(0, breakAt)))
					: sendMsg(msg.channel, str.substr(0, breakAt));

				str = str.substr(breakAt);
			}
		}
	};

	return evaluate;
};

function removeToken(bot, str, code) {
	return (str.includes(bot.token))
		? str.replace(bot.token, '*'.repeat(bot.token.length))
		: (code.toLowerCase().includes('token'))
			? '*'.repeat(bot.token.length)
			: str;
}

function findBreakIndex(str, char) {
	const softLimit = 1985;

	const charIndex = str.lastIndexOf(char, softLimit);
	const hasChar = charIndex !== -1;

	const spaceIndex = str.lastIndexOf(' ', softLimit);
	const hasSpace = spaceIndex !== -1;

	return (str.length > softLimit)
		? (hasChar)
			? charIndex + char.length
			: (hasSpace)
				? spaceIndex + 1
				: softLimit
		: softLimit;
}