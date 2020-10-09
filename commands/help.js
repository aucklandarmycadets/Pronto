const Discord = require('discord.js');

const config = require('../config');
const { config: { prefix }, ids: { serverID, devID, adjPlus } } = config;
const { emojis: { successEmoji, errorEmoji }, colours } = config;
const { cmds: { help }, cmdsList } = require('../cmds');
const { cmdPermsCheck, dmError, debugError, dmCmdError, embedScaffold } = require('../modules');

module.exports = {
	name: help.cmd,
	description: help.desc.general,
	allowDM: help.allowDM,
	roles: help.roles,
	noRoles: help.noRoles,
	devOnly: help.devOnly,
	help: help.help,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const messageAuthor = msg.author;
		const server = bot.guilds.cache.get(serverID);
		const helpEmbed = new Discord.MessageEmbed();
		const memberRoles = (msg.guild) ? msg.member.roles.cache : server.members.cache.get(messageAuthor.id).roles.cache;
		const msgCmd = args[0];

		if (!msg.guild && !server.available) {
			const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);
			msg.react(errorEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));
			return embedScaffold(messageAuthor, 'There was an error reaching the server, please try again later.', colours.error, 'dm');
		}

		if (msg.guild) msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

		if (bot.commands.has(msgCmd)) {
			const cmd = bot.commands.get(msgCmd);
			cmdPermsCheck(msg, cmd) ? sendHelpEmbed(cmd) : false;
		}

		let commandList;

		for (const values of Object.values(cmdsList)) {
			if (!values.type) commandList = values.cmds;
			if (values.type === 'noRole') {
				commandList = (!memberRoles.some(roles => values.ids.includes(roles.id))) ? values.cmds : commandList;
			}
			else if (values.type === 'role') {
				commandList = (memberRoles.some(roles => values.ids.includes(roles.id))) ? values.cmds : commandList;
			}
			else if (values.type === 'user') {
				commandList = (messageAuthor.id === devID) ? values.cmds : commandList;
			}
		}

		const dev = bot.users.cache.get(devID);

		if (!msg.guild && msgCmd) {
			const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);
			msg.react(errorEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));
		}

		else if (!msg.guild) {
			const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);
			msg.react(successEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));
		}

		helpEmbed.setTitle('Commands List');
		helpEmbed.setThumbnail('https://i.imgur.com/EzmJVyV.png');
		helpEmbed.setColor(colours.pronto);
		helpEmbed.setDescription(commandList);
		helpEmbed.setFooter(`Developed by ${dev.tag}`, dev.avatarURL());

		if (!memberRoles.some(roles => adjPlus.includes(roles.id)) && messageAuthor.id !== devID) {
			helpEmbed.addField('Note', `Only displaying commands available to ${messageAuthor}.`);
		}

		messageAuthor.send(helpEmbed).catch(error => dmError(msg, error));

		function sendHelpEmbed(command) {
			helpEmbed.setTitle(`Command: ${prefix}${command.name}`);
			helpEmbed.setColor(colours.pronto);
			helpEmbed.setDescription(command.help);
			if (msg.guild) {
				helpEmbed.setFooter(`Requested by ${msg.member.displayName}`);
				return msg.channel.send(helpEmbed);
			}

			else if (!helpEmbed.description.includes('Allowed Roles')) {
				const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);
				msg.react(successEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));
				return messageAuthor.send(helpEmbed).catch(error => dmError(msg, error));
			}

			else return dmCmdError(msg, 'hasRole');
		}
	},
};