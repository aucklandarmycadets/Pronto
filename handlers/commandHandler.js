'use strict';

const Discord = require('discord.js');
const { debugError, dmCmdError, pCmd } = require('../modules');

module.exports = async msg => {
	const { bot } = require('../pronto');
	const { permissionsHandler } = require('./');
	const { config: { prefix } } = await require('./database')(msg.guild);
	const { cmds: { help } } = await require('../cmds')(msg.guild);

	if (msg.author.bot || !msg.content.startsWith(prefix)) return;

	bot.commands = new Discord.Collection();
	const botCommands = await require('../commands')(msg.guild);

	Object.keys(botCommands).map(key => {
		bot.commands.set(botCommands[key].cmd, botCommands[key]);
	});

	const args = msg.content.split(/ +/);
	const msgCmd = args.shift().toLowerCase().replace(prefix, '');
	const helpCmd = bot.commands.get(help.cmd);

	const cmd = bot.commands.get(msgCmd) || bot.commands.find(command => command.aliases && command.aliases.includes(msgCmd));

	if (!cmd) {
		const regExp = /[a-zA-Z]/g;
		if (!regExp.test(msgCmd)) return;
		else if (!msg.guild) return dmCmdError(msg);
		else return helpCmd.execute(msg, args);
	}

	const hasPerms = permissionsHandler(msg, cmd);

	if (hasPerms === 'err') return;

	if (msg.guild && !hasPerms) return helpCmd.execute(msg, args);
	else if (!msg.guild && !hasPerms) return dmCmdError(msg, 'noPerms');
	else if (!msg.guild && !cmd.allowDM) return dmCmdError(msg, 'noDM');

	try {
		cmd.execute(msg, args);
	}

	catch (error) {
		debugError(error, `Error executing ${pCmd(cmd, msg.guild)}`);
	}
};