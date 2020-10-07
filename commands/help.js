const Discord = require('discord.js');

const modules = require('../modules');
const { cmdTxt: { helpGeneric } } = modules;
const { embedScaffold, debugError, dmCmdError, dmError } = modules;
const { cmdList: {
	helpCmd,
	pingCmd,
	uptimeCmd,
	restartCmd,
	leaveCmd,
	leaveForCmd,
	attendanceCmd,
	connectedCmd,
	archiveCmd,
	purgeCmd,
} } = modules;
const { constObj: {
	prefix,
	devID,
	serverID,
	error: errorRed,
	yellow,
	nonCadet,
	tacPlus,
	sgtPlus,
	cqmsPlus,
	adjPlus,
	successEmoji,
	errorEmoji,
} } = modules;
const { helpObj: {
	helpAll,
	helpCadet,
	helpTacPlus,
	helpSgtPlus,
	helpCqmsPlus,
	helpAdjPlus,
	helpDev,
	helpPing,
	helpUptime,
	helpRestart,
	helpHelp,
	helpLeave,
	helpLeaveFor,
	helpAttendance,
	helpConnected,
	helpArchive,
	helpPurge,
} } = modules;

module.exports = {
	name: helpCmd,
	description: helpGeneric,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const messageAuthor = msg.author;
		const helpEmbed = new Discord.MessageEmbed();
		const cmd = args[0];
		let cmdHelp;

		if (!msg.guild && cmd === leaveCmd) {
			const server = bot.guilds.cache.get(serverID);

			if (!server.available) {
				const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);
				msg.react(errorEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in DMs.`));
				embedScaffold(messageAuthor, 'There was an error reaching the server, please try again later.', errorRed, 'dm');
				return;
			}

			const memberRoles = server.members.cache.get(messageAuthor.id).roles.cache;

			if (!memberRoles.some(roles => nonCadet.includes(roles.id))) {
				const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);
				msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in DMs.`));

				helpEmbed.setTitle(`Command: ${prefix}${leaveCmd}`);
				helpEmbed.setColor(yellow);
				helpEmbed.setDescription(helpLeave);
				messageAuthor.send(helpEmbed);
			}

			else dmCmdError(msg);
			return;
		}

		if (msg.guild) msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

		let commandList = helpAll;
		const memberRoles = msg.member.roles.cache;

		if (cmd === helpCmd) createHelpEmbed(helpCmd, helpHelp);

		if (!memberRoles.some(roles => nonCadet.includes(roles.id))) {
			commandList = helpCadet;
			if (cmd === leaveCmd) createHelpEmbed(leaveCmd, helpLeave);
		}

		if (memberRoles.some(roles => tacPlus.includes(roles.id))) {
			commandList = helpTacPlus;
			if (cmd === leaveForCmd) createHelpEmbed(leaveForCmd, helpLeaveFor);
			else if (cmd === attendanceCmd) createHelpEmbed(attendanceCmd, helpAttendance);
		}

		if (memberRoles.some(roles => sgtPlus.includes(roles.id))) {
			commandList = helpSgtPlus;
			if (cmd === connectedCmd) createHelpEmbed(connectedCmd, helpConnected);
		}

		if (memberRoles.some(roles => cqmsPlus.includes(roles.id))) {
			commandList = helpCqmsPlus;
			if (cmd === archiveCmd) createHelpEmbed(archiveCmd, helpArchive);
		}

		if (memberRoles.some(roles => adjPlus.includes(roles.id))) {
			commandList = helpAdjPlus;
			if (cmd === purgeCmd) createHelpEmbed(purgeCmd, helpPurge);
		}

		if (messageAuthor.id === devID) {
			commandList = helpDev;
			if (cmd === pingCmd) createHelpEmbed(pingCmd, helpPing);
			else if (cmd === uptimeCmd) createHelpEmbed(uptimeCmd, helpUptime);
			else if (cmd === restartCmd) createHelpEmbed(restartCmd, helpRestart);
		}

		if (!cmdHelp) {
			const dev = bot.users.cache.get(devID);

			helpEmbed.setTitle('Commands List');
			helpEmbed.setThumbnail('https://i.imgur.com/EzmJVyV.png');
			helpEmbed.setColor(yellow);
			helpEmbed.setDescription(commandList);
			helpEmbed.setFooter(`Developed by ${dev.tag}`, dev.avatarURL());

			if (!memberRoles.some(roles => adjPlus.includes(roles.id)) && messageAuthor.id !== devID) {
				helpEmbed.addField('Note', `Only displaying commands available to ${messageAuthor}.`);
			}

			messageAuthor.send(helpEmbed).catch(error => dmError(msg, error));
		}

		else msg.channel.send(helpEmbed);

		function createHelpEmbed(command, text) {
			helpEmbed.setTitle(`Command: ${prefix}${command}`);
			helpEmbed.setColor(yellow);
			helpEmbed.setDescription(text);
			helpEmbed.setFooter(`Requested by ${msg.member.displayName}`);
			cmdHelp = true;
		}
	},
};