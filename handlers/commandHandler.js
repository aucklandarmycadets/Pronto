'use strict';

const Discord = require('discord.js');
const { debugError, dmCmdError, prefixCmd, stripID } = require('../modules');

/**
 *
 * @param {Discord.Message} msg The \<Message> that emitted the \<Client>#message event
 */
module.exports = async msg => {
	if (msg.author.bot) return;

	const { bot } = require('../pronto');
	const { ids: { DEVELOPER_ID } } = require('../config');
	const { updateCommands, permissionsHandler } = require('./');

	const guilds = bot.guilds.cache.filter(_guild => _guild.members.cache.has(msg.author.id));

	if (!msg.guild && guilds.size !== 1 && msg.author.id !== DEVELOPER_ID) return dmCmdError(msg, 'MULTIPLE_GUILDS');

	const guild = msg.guild || guilds.first();

	const { settings: { prefix }, cmds: { help } } = await require('./database')(guild);

	const args = msg.content.split(/ +/);

	const usesPrefix = msg.content.toLowerCase().startsWith(prefix.toLowerCase());
	const usesBotMention = stripID(args[0]) === bot.user.id;

	if (!usesPrefix && (!usesBotMention || args.length === 1)) return;

	await updateCommands(guild);

	bot.commands = new Discord.Collection();
	const commands = await require('../commands')(guild);

	Object.keys(commands).map(key => {
		bot.commands.set(commands[key].cmd, commands[key]);
	});

	const msgCmd = (usesBotMention)
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

	if (hasPerms === 'ERROR') return;

	if (msg.guild && !hasPerms) return helpCmd.execute(msg, args);
	else if (!msg.guild && !hasPerms) return dmCmdError(msg, 'NO_PERMISSION');
	else if (!msg.guild && !cmd.allowDM) return dmCmdError(msg, 'NO_DIRECT');

	try {
		cmd.execute(msg, args, msgCmd);
	}

	catch (error) {
		debugError(error, `Error executing ${await prefixCmd(cmd, guild)}`);
	}
};