const Discord = require('discord.js');

const { colours, ...config } = require('../config');
const { cmds: { evaluate, ...cmds }, ...cmdsList } = require('../cmds');
const { dtg, sendMsg, cmdError, ...modules } = require('../modules');

module.exports = evaluate;
module.exports.execute = (msg, args) => {
	'use strict';

	const { bot } = require('../pronto');

	if (args.length === 0) return cmdError(msg, 'You must enter something to evaluate.', evaluate.error);

	const code = args.join(' ');

	try {
		const embed = new Discord.MessageEmbed();

		let evaled = eval(code);

		if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);

		msgSplit([evaled], '},').forEach(str => sendMsg(msg.channel, `\`\`\`js\n${str}\`\`\``));
	}

	catch (error) { msgSplit([error.stack], ')').forEach(str => sendMsg(msg.channel, `\`\`\`js\n${str}\`\`\``)); }
};

const last = arr => { return arr[arr.length - 1]; };

const splitOn = (slicable, ...indices) => [0, ...indices].map((n, i, m) => slicable.slice(n, m[i + 1]));

const msgSplit = (arr, char) => {
	let string = last(arr);

	while (string.length > 2000) {
		const breakAt = string.lastIndexOf(char, 1990) + char.length;

		arr.pop();
		splitOn(string, breakAt).forEach(str => arr.push(str));

		string = last(arr);
	}

	return arr;
};