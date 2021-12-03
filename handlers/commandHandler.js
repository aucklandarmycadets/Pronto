'use strict';

const Discord = require('discord.js');
const { debugError, directCommandError, prefixCommand, stripID } = require('../modules');

/**
 *
 * @param {Discord.Message} msg The \<Message> that emitted the \<Client>#message event
 */
module.exports = async msg => {
	if (msg.author.bot) return;

	const { bot } = require('../pronto');
	const { ids: { DEVELOPER_ID } } = require('../config');
	const { upsertCommands, permissionsHandler } = require('./');

	const guilds = bot.guilds.cache.filter(_guild => _guild.members.cache.has(msg.author.id));

	if (!msg.guild && guilds.size !== 1 && msg.author.id !== DEVELOPER_ID) return directCommandError(msg, 'MULTIPLE_GUILDS');

	const guild = msg.guild || guilds.first();

	const { settings: { prefix }, commands: { help } } = await require('./database')(guild);

	const args = msg.content.split(/ +/);

	const usesPrefix = msg.content.toLowerCase().startsWith(prefix.toLowerCase());
	const usesBotMention = stripID(args[0]) === bot.user.id;

	if (!usesPrefix && (!usesBotMention || args.length === 1)) return;

	await upsertCommands(guild);

	bot.commands = new Discord.Collection();
	const commands = await require('../commands')(guild);

	Object.keys(commands).map(key => {
		bot.commands.set(commands[key].command, commands[key]);
	});

	const msgCommand = (usesBotMention)
		? args.splice(0, 2)[1].toLowerCase()
		: args.shift().toLowerCase().replace(prefix.toLowerCase(), '');

	const command = bot.commands.get(msgCommand) || bot.commands.find(_command => _command.aliases.includes(msgCommand));

	const helpCommand = bot.commands.get(help.command);

	if (!command) {
		const regExp = /[a-zA-Z]/g;
		return (regExp.test(msgCommand))
			? (!msg.guild)
				? directCommandError(msg)
				: helpCommand.execute({ msg, args })
			: null;
	}

	const hasPerms = await permissionsHandler(msg, command);

	if (hasPerms === 'ERROR') return;

	if (msg.guild && !hasPerms) return helpCommand.execute({ msg, args });
	else if (!msg.guild && !hasPerms) return directCommandError(msg, 'NO_PERMISSION');
	else if (!msg.guild && !command.allowDirect) return directCommandError(msg, 'NO_DIRECT');

	try {
		command.execute({ msg, args, msgCommand });
	}

	catch (error) {
		debugError(error, `Error executing ${await prefixCommand(command, guild)}`);
	}
};