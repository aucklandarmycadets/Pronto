const Discord = require('discord.js');

const config = require('../config');
const { ids: { serverID, devID, nonCadet, tacPlus, sgtPlus, cqmsPlus, adjPlus } } = config;
const { emojis: { successEmoji, errorEmoji }, colours } = config;
const { cmds, cmdsList } = require('../cmds');
const { pCmd, dmError, debugError, dmCmdError, embedScaffold } = require('../modules');

module.exports = {
	name: cmds.help.cmd,
	description: cmds.help.desc.general,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const messageAuthor = msg.author;
		const helpEmbed = new Discord.MessageEmbed();
		const cmd = args[0];
		let cmdHelp;

		if (!msg.guild && cmd === cmds.leave.cmd) {
			const server = bot.guilds.cache.get(serverID);

			if (!server.available) {
				const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);
				msg.react(errorEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in DMs.`));
				embedScaffold(messageAuthor, 'There was an error reaching the server, please try again later.', colours.error, 'dm');
				return;
			}

			const memberRoles = server.members.cache.get(messageAuthor.id).roles.cache;

			if (!memberRoles.some(roles => nonCadet.includes(roles.id))) {
				const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);
				msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in DMs.`));

				helpEmbed.setTitle(`Command: ${pCmd(cmds.leave)}`);
				helpEmbed.setColor(colours.pronto);
				helpEmbed.setDescription(cmds.leave.help);
				messageAuthor.send(helpEmbed);
			}

			else dmCmdError(msg);
			return;
		}

		if (msg.guild) msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

		let commandList = cmdsList.all;
		const memberRoles = msg.member.roles.cache;

		if (cmd === cmds.help.cmd) createHelpEmbed(cmds.help);

		if (!memberRoles.some(roles => nonCadet.includes(roles.id))) {
			commandList = cmdsList.cdt;
			if (cmd === cmds.leave.cmd) createHelpEmbed(cmds.leave);
		}

		if (memberRoles.some(roles => tacPlus.includes(roles.id))) {
			commandList = cmdsList.tac;
			if (cmd === cmds.leaveFor.cmd) createHelpEmbed(cmds.leaveFor);
			else if (cmd === cmds.attendance.cmd) createHelpEmbed(cmds.attendance);
		}

		if (memberRoles.some(roles => sgtPlus.includes(roles.id))) {
			commandList = cmdsList.sgt;
			if (cmd === cmds.connected.cmd) createHelpEmbed(cmds.connected);
		}

		if (memberRoles.some(roles => cqmsPlus.includes(roles.id))) {
			commandList = cmdsList.cqms;
			if (cmd === cmds.archive.cmd) createHelpEmbed(cmds.archive);
		}

		if (memberRoles.some(roles => adjPlus.includes(roles.id))) {
			commandList = cmdsList.adj;
			if (cmd === cmds.purge.cmd) createHelpEmbed(cmds.purge);
		}

		if (messageAuthor.id === devID) {
			commandList = cmdsList.dev;
			if (cmd === cmds.ping.cmd) createHelpEmbed(cmds.ping);
			else if (cmd === cmds.uptime.cmd) createHelpEmbed(cmds.uptime);
			else if (cmd === cmds.restart.cmd) createHelpEmbed(cmds.restart);
		}

		if (!cmdHelp) {
			const dev = bot.users.cache.get(devID);

			helpEmbed.setTitle('Commands List');
			helpEmbed.setThumbnail('https://i.imgur.com/EzmJVyV.png');
			helpEmbed.setColor(colours.pronto);
			helpEmbed.setDescription(commandList);
			helpEmbed.setFooter(`Developed by ${dev.tag}`, dev.avatarURL());

			if (!memberRoles.some(roles => adjPlus.includes(roles.id)) && messageAuthor.id !== devID) {
				helpEmbed.addField('Note', `Only displaying commands available to ${messageAuthor}.`);
			}

			messageAuthor.send(helpEmbed).catch(error => dmError(msg, error));
		}

		else msg.channel.send(helpEmbed);

		function createHelpEmbed(command) {
			helpEmbed.setTitle(`Command: ${pCmd(command)}`);
			helpEmbed.setColor(colours.pronto);
			helpEmbed.setDescription(command.help);
			helpEmbed.setFooter(`Requested by ${msg.member.displayName}`);
			cmdHelp = true;
		}
	},
};