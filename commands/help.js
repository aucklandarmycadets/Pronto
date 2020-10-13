const Discord = require('discord.js');

const config = require('../config');
const { config: { prontoLogo }, ids: { serverID, devID, adjPlus } } = config;
const { emojis: { successEmoji, errorEmoji }, colours } = config;
const { cmds: { help }, cmdsList } = require('../cmds');
const { pCmd, cmdPermsCheck, getRoleError, sendMsg, dmError, debugError, dmCmdError, embedScaffold } = require('../modules');

module.exports = help;
module.exports.execute = (msg, args) => {
	'use strict';

	const { bot } = require('../pronto.js');
	const messageAuthor = msg.author;
	const server = bot.guilds.cache.get(serverID);
	const helpEmbed = new Discord.MessageEmbed();
	const msgCmd = args[0].toLowerCase();

	const memberRoles = (msg.guild)
		? msg.member.roles.cache
		: server.members.cache.get(messageAuthor.id).roles.cache;

	if (!memberRoles) return getRoleError(msg);

	if (!msg.guild && !server.available) {
		const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);
		msg.react(errorEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));

		return embedScaffold(messageAuthor, 'There was an error reaching the server, please try again later.', colours.error, 'dm');
	}

	if (msg.guild) msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

	const cmd = bot.commands.get(msgCmd) || bot.commands.find(command => command.aliases && command.aliases.includes(msgCmd));

	(cmd)
		? cmdPermsCheck(msg, cmd)
			? sendHelpEmbed(cmd)
			: (msg.guild)
				? sendCmdList()
				: dmCmdError(msg, 'noPerms')
		: sendCmdList();

	function sendHelpEmbed(command) {
		helpEmbed.setTitle(`Command: ${pCmd(command)}`);
		helpEmbed.setColor(colours.pronto);
		helpEmbed.setDescription(command.help);

		if (msg.guild) {
			helpEmbed.setFooter(`Requested by ${msg.member.displayName}`);
			return sendMsg(msg.channel, helpEmbed);
		}

		else if (!helpEmbed.description.includes('Allowed Roles')) {
			const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);
			msg.react(successEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));
			return messageAuthor.send(helpEmbed).catch(error => dmError(msg, error));
		}

		else return dmCmdError(msg, 'hasRole');
	}

	function sendCmdList() {
		let commandList;

		for (const values of Object.values(cmdsList)) {
			if (!values.type) commandList = values.cmds;

			if (values.type === 'noRole') {
				commandList = (!memberRoles.some(roles => values.ids.includes(roles.id)))
					? values.cmds
					: commandList;
			}

			else if (values.type === 'role') {
				commandList = (memberRoles.some(roles => values.ids.includes(roles.id)))
					? values.cmds
					: commandList;
			}

			else if (values.type === 'dev') {
				commandList = (messageAuthor.id === devID)
					? values.cmds
					: commandList;
			}
		}

		const james = bot.users.cache.get('192181901065322496');

		if (!msg.guild && msgCmd) {
			const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);
			msg.react(errorEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));
		}

		else if (!msg.guild) {
			const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);
			msg.react(successEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));
		}

		helpEmbed.setTitle('Commands List');
		helpEmbed.setThumbnail(prontoLogo);
		helpEmbed.setColor(colours.pronto);
		helpEmbed.setDescription(commandList);
		helpEmbed.setFooter(`Developed by ${james.tag}`, james.avatarURL());

		if (!memberRoles.some(roles => adjPlus.includes(roles.id)) && messageAuthor.id !== devID) {
			helpEmbed.addField('Note', `Only displaying commands available to ${messageAuthor}.`);
		}

		messageAuthor.send(helpEmbed).catch(error => dmError(msg, error));
	}
};