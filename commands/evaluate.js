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

		const shortFlags = args.filter(arg => arg.match(/(?<![-a-zA-Z])-[A-z]+(?![\s\S]*})/g))
			.flatMap(flags => [...flags.replace('-'), '']);

		const codeBlock = !(args.includes('--no-code') || args.includes('--plain') || shortFlags.includes('P'));

		const silent = (args.includes('--silent') || shortFlags.includes('s'));

		if (args.includes('--delete') || shortFlags.includes('d')) deleteMsg(msg);

		if (args[0].includes('```')) {
			const _args = args.join(' ').split('\n');
			args = _args.slice(1, _args.length - 1);
		}
		args = args.filter(arg => !arg.match(/(?<!(?<!--\w*)[a-zA-Z])-{1,2}[a-zA-Z]+/g));

		if (args.length === 0) return cmdError(msg, 'You must enter something to evaluate.', evaluate.error);

		const code = args.join(' ');

		try {
			const embed = new Discord.MessageEmbed();

			let evaled = (!code.toLowerCase().includes('token'))
				? await eval(`(async () => { return ${code} })()`)
				: '*'.repeat(bot.token.length);

			if (code.includes('embed.')) sendMsg(msg.channel, { embeds: [embed] });

			if (silent) return;

			if (typeof evaled !== 'string') evaled = convertToString(evaled);

			evaled = removeSensitive(bot, evaled, code);

			msgSplit(result.replace(/```j?s?/g, ''), '},');
		}

		catch (error) { msgSplit(error.stack, ')'); }

		function msgSplit(str, char) {
			while (str) {
				const breakAt = findBreakIndex(str, char);

				(codeBlock)
					? sendMsg(msg.channel, { content: js(str.substr(0, breakAt)) })
					: sendMsg(msg.channel, { content: str.substr(0, breakAt) });

				str = str.substr(breakAt);
			}
		}
	};

	return evaluate;
};

function convertToString(obj) {
	return require('util').inspect(obj);
}

function removeSensitive(bot, str) {
	const githook = convertToString(process.env.githook);
	const sensitives = [process.env.TOKEN, githook.substr(1, githook.length - 2), process.env.SECRET, process.env.MONGOURI];

	for (let i = 0; i < sensitives.length; i++) {
		str = str.replace(new RegExp(sensitives[i], 'g'), '*'.repeat(sensitives[i].length));
	}

	return str;
}

function findBreakIndex(str, char) {
	// The maximum index at which to break the message
	// This derives from the Discord limit of 2000 characters, but accounts for the presence of a Javascript codeblock
	// 2000 - '```js\n```' = 1991
	const softLimit = 1990;

	const charIndex = str.lastIndexOf(char, softLimit - char.length);
	const hasChar = charIndex !== -1;

	const spaceIndex = str.lastIndexOf(' ', softLimit - 1);
	const hasSpace = spaceIndex !== -1;

	return (str.length > softLimit)
		? (hasChar)
			? charIndex + char.length
			: (hasSpace)
				? spaceIndex
				: softLimit
		: softLimit;
}