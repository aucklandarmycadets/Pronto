'use strict';

const Discord = require('discord.js');
const { debugError, dmCmdError, pCmd, stripID } = require('../modules');

module.exports = async msg => {
	if (msg.author.bot) return;

	const { bot } = require('../pronto');
	const { updateCommands, permissionsHandler } = require('./');
	const { config: { prefix }, cmds: { help } } = await require('./database')(msg.guild);

	const args = msg.content.split(/ +/);

	const hasPrefix = msg.content.toLowerCase().startsWith(prefix.toLowerCase());
	const hasBotMention = stripID(args[0]) === bot.user.id;

	if (!hasPrefix && (!hasBotMention || args.length === 1)) return;

	await updateCommands(msg.guild);

	bot.commands = new Discord.Collection();
	const commands = await require('../commands')(msg.guild);

	Object.keys(commands).map(key => {
		bot.commands.set(commands[key].cmd, commands[key]);
	});

	const msgCmd = (hasBotMention)
		? args.splice(0, 2)[1].toLowerCase()
		: args.shift().toLowerCase().replace(prefix.toLowerCase(), '');

	const cmd = bot.commands.get(msgCmd) || bot.commands.find(_cmd => _cmd.aliases.includes(msgCmd));

	const helpCmd = bot.commands.get(help.cmd);

	if (!cmd) {
		const regExp = /[a-zA-Z]/g;
		return (regExp.test(msgCmd))
			? (!msg.guild)
				? dmCmdError(msg)
				: helpCmd.execute(msg, args)
			: null;
	}

	const hasPerms = await permissionsHandler(msg, cmd);

	if (hasPerms === 'err') return;

	if (msg.guild && !hasPerms) return helpCmd.execute(msg, args);
	else if (!msg.guild && !hasPerms) return dmCmdError(msg, 'noPerms');
	else if (!msg.guild && !cmd.allowDM) return dmCmdError(msg, 'noDM');

	try {
		cmd.execute(msg, args, msgCmd);
	}

	catch (error) {
		debugError(error, `Error executing ${await pCmd(cmd, msg.guild)}`);
	}
};