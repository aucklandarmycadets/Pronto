'use strict';

const Discord = require('discord.js');
const dateFormat = require('dateformat');

let bot;

function initialise(Client) {
	bot = Client;
}

const constObj = {
	prefix: '-',
	serverID: '285276130284404750',
	devID: '192181901065322496',
	debugID: '760745439225577482',
	logID: '761907992332861440',
	attendanceID: '760820697542426644',
	recruitingID: '761160822008315915',
	newMembersID: '761162254498136084',
	archivedID: '761180123336146974',
	tacticalID: '285345887365103628',
	classroomID: '761191298614558720',
	visitorID: '285284113655791617',
	successEmoji: 'success',
	errorEmoji: 'error',
	formations: ['285282771189104640'],
	nonCadet: ['285284113655791617'],
	tacPlus: ['285282771189104640', '285283924542881792', '285283751695745033', '285283460078239785', '285282768286646272'],
	sgtPlus: ['285283924542881792', '285283751695745033', '285283460078239785', '285282768286646272'],
	cqmsPlus: ['285283751695745033', '285283460078239785', '285282768286646272'],
	adjPlus: ['285283460078239785', '285282768286646272'],
	administratorID: '285282768286646272',
	grey: 0x1b1b1b,
	red: 0xd31145,
	yellow: 0xffd456,
	success: 0x45bb8a,
	error: 0xef4949,
	dateOutput: 'HHMM "h" ddd, dd mmm yy',
	version: '1.9.0',
};

const cmdList = {
	pingCmd: 'ping',
	uptimeCmd: 'uptime',
	restartCmd: 'restart',
	helpCmd: 'help',
	leaveCmd: 'leave',
	leaveForCmd: 'leavefor',
	attendanceCmd: 'attendance',
	connectedCmd: 'connected',
	archiveCmd: 'archive',
	purgeCmd: 'purge',
};

const cmdTxt = {
	pingDesc: 'Test the latency of the bot.',
	uptimeDesc: 'Time since last restart.',
	restartDesc: 'Restart the bot.',
	helpGeneric: 'Get help with commands.',
	helpDesc: 'Message a list of all commands.',
	helpArg: 'Get help with a command.',
	leaveDesc: 'Submit a leave request.',
	leaveForDesc: 'Submit a leave request for another cadet.',
	attendanceDesc: 'Submit an attendance register.',
	connectedDesc: 'List of members connected to a voice channel.',
	archiveDesc: 'Archive a text channel.',
	purgeDesc: 'Delete a number of messages from a channel.',
};

const dmCmds = [
	`${constObj.prefix}${cmdList.pingCmd}`,
	`${constObj.prefix}${cmdList.uptimeCmd}`,
	`${constObj.prefix}${cmdList.helpCmd} ${cmdList.leaveCmd}`,
];

const helpObj = {
	helpAll: helpText({
		[`${constObj.prefix}${cmdList.helpCmd}`]: cmdTxt.helpDesc,
		[`${constObj.prefix}${cmdList.helpCmd} [command]`]: cmdTxt.helpArg,
	}, '`', '` - '),

	get helpCadet() {
		return this.helpAll + '\n' + helpText({
			[`${constObj.prefix}${cmdList.leaveCmd}`]: cmdTxt.leaveDesc,
		}, '`', '` - ');
	},

	get helpTacPlus() {
		return this.helpCadet + '\n' + helpText({
			[`${constObj.prefix}${cmdList.leaveForCmd}`]: cmdTxt.leaveForDesc,
			[`${constObj.prefix}${cmdList.attendanceCmd}`]: cmdTxt.attendanceDesc,
		}, '`', '` - ');
	},

	get helpSgtPlus() {
		return this.helpTacPlus + '\n' + helpText({
			[`${constObj.prefix}${cmdList.connectedCmd}`]: cmdTxt.connectedDesc,
		}, '`', '` - ');
	},

	get helpCqmsPlus() {
		return this.helpSgtPlus + '\n' + helpText({
			[`${constObj.prefix}${cmdList.archiveCmd}`]: cmdTxt.archiveDesc,
		}, '`', '` - ');
	},

	get helpAdjPlus() {
		return this.helpCqmsPlus + '\n' + helpText({
			[`${constObj.prefix}${cmdList.purgeCmd}`]: cmdTxt.purgeDesc,
		}, '`', '` - ');
	},

	get helpDev() {
		return helpText({
			[`${constObj.prefix}${cmdList.pingCmd}`]: cmdTxt.pingDesc,
			[`${constObj.prefix}${cmdList.uptimeCmd}`]: cmdTxt.uptimeDesc,
			[`${constObj.prefix}${cmdList.restartCmd}`]: cmdTxt.restartDesc,
		}, '`', '` - ') + '\n' + this.helpAdjPlus;
	},

	helpPing: helpText({
		'Description': cmdTxt.pingDesc,
		'Usage': `${constObj.prefix}${cmdList.pingCmd}`,
	}, '**', ':** '),

	helpUptime: helpText({
		'Description': cmdTxt.uptimeDesc,
		'Usage': `${constObj.prefix}${cmdList.uptimeCmd}`,
	}, '**', ':** '),

	helpRestart: helpText({
		'Description': cmdTxt.restartDesc,
		'Usage': `${constObj.prefix}${cmdList.restartCmd}`,
	}, '**', ':** '),

	helpHelp: helpText({
		'Description': cmdTxt.helpGeneric,
		'Usage': `${constObj.prefix}${cmdList.helpCmd} [command]`,
		'Examples': `\n${constObj.prefix}${cmdList.helpCmd}\n${constObj.prefix}${cmdList.helpCmd} ${cmdList.leaveCmd}`,
	}, '**', ':** '),

	helpLeave: helpText({
		'Description': cmdTxt.leaveDesc,
		'Usage': `${constObj.prefix}${cmdList.leaveCmd} <dates> <activity> <reason> [additional remarks]`,
		'Example': `${constObj.prefix}${cmdList.leaveCmd} 01 Jan for Parade Night due to an appointment`,
	}, '**', ':** '),

	helpLeaveFor: helpText({
		'Description': cmdTxt.leaveForDesc,
		'Usage': `${constObj.prefix}${cmdList.leaveForCmd} <user> <dates> <activity> <reason> [additional remarks]`,
		'Example': `${constObj.prefix}${cmdList.leaveForCmd} <@${constObj.devID}> 01 Jan for Parade Night due to an appointment`,
		'Allowed Roles': rolesOutput(constObj.tacPlus),
	}, '**', ':** '),

	helpAttendance: helpText({
		'Description': cmdTxt.attendanceDesc,
		'Usage': `${constObj.prefix}${cmdList.attendanceCmd} <message>`,
		'Allowed Roles': rolesOutput(constObj.tacPlus),
	}, '**', ':** '),

	helpConnected: helpText({
		'Description': cmdTxt.connectedDesc,
		'Usage': `${constObj.prefix}${cmdList.connectedCmd} <voice channel>`,
		'Example': `${constObj.prefix}${cmdList.connectedCmd} <#${constObj.classroomID}>`,
		'Allowed Roles': rolesOutput(constObj.sgtPlus),
	}, '**', ':** '),

	helpArchive: helpText({
		'Description': cmdTxt.archiveDesc,
		'Usage': `${constObj.prefix}${cmdList.archiveCmd} <text channel>`,
		'Example': `${constObj.prefix}${cmdList.archiveCmd} <#${constObj.tacticalID}>`,
		'Allowed Roles': rolesOutput(constObj.cqmsPlus),
	}, '**', ':** '),

	helpPurge: helpText({
		'Description': cmdTxt.purgeDesc,
		'Usage': `${constObj.prefix}${cmdList.purgeCmd} <count> [user]`,
		'Examples': `\n${constObj.prefix}${cmdList.purgeCmd} 10\n${constObj.prefix}${cmdList.purgeCmd} 5 <@${constObj.devID}>`,
		'Allowed Roles': rolesOutput(constObj.adjPlus),
	}, '**', ':** '),

	get errorLeave() {
		return errorText(this.helpLeave, cmdList.leaveCmd);
	},

	get errorLeaveFor() {
		return errorText(this.helpLeaveFor, cmdList.leaveForCmd);
	},

	get errorAttendance() {
		return errorText(this.helpAttendance, cmdList.attendanceCmd);
	},

	get errorConnected() {
		return errorText(this.helpConnected, cmdList.connectedCmd);
	},

	get errorArchive() {
		return errorText(this.helpArchive, cmdList.archiveCmd);
	},

	get errorPurge() {
		return errorText(this.helpPurge, cmdList.purgeCmd);
	},
};

function helpText(object, startFormat, endFormat) {
	let helpString = '';
	const objProperties = [];
	const objValues = [];

	for (const property in object) {
		if (Object.prototype.hasOwnProperty.call(object, property)) {
			objProperties.push(property);
			objValues.push(object[property]);
		}
	}

	for (let i = 0; i < objProperties.length; i++) {
		helpString += `${startFormat}${objProperties[i]}${endFormat}${objValues[i]}`;

		if (i < (objProperties.length - 1)) helpString += '\n';
	}
	return helpString;
}

function errorText(helpTxt, cmd) {
	return '\n\n' + helpTxt + '\n' + helpText({
		'Help Command': `${constObj.prefix}${cmdList.helpCmd} ${cmd}`,
	}, '**', ':** ');
}

function rolesOutput(array, skipFormat) {
	let rolesString = '';
	const filteredArray = array.filter(role => role !== constObj.administratorID && role.name !== '@everyone');

	for (let i = 0; i < filteredArray.length; i++) {
		if (i % 3 === 0) rolesString += '\n';
		if (skipFormat) rolesString += `${filteredArray[i]} `;
		else rolesString += `<@&${filteredArray[i]}> `;
	}
	return rolesString;
}

function capitalise(string) {
	if (typeof string !== 'string') return '';
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function sendErrorEmbed(msg, errMsg, cmdErr, footer) {
	const errorEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === constObj.errorEmoji);

	msg.react(errorEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

	const errorEmbed = new Discord.MessageEmbed()
		.setColor(constObj.error)
		.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
		.setDescription(`${msg.author} ${errMsg} ${cmdErr}`);

	if (footer) errorEmbed.setFooter(footer);

	msg.channel.send(errorEmbed);
}

function formatAge(raw) {
	let years = 0;
	let months = 0;
	let days = 0;
	let hours = 0;
	let minutes = 0;
	let seconds = 0;

	if (raw > 31556952000) years = Math.floor(raw / 31556952000);
	if ((raw - (years * 31556952000)) > 2629800000) months = Math.floor((raw - (years * 31556952000)) / 2629800000);
	if ((raw - (years * 31556952000) - (months * 2629800000)) > 86400000) days = Math.floor((raw - (years * 31556952000) - (months * 2629800000)) / 86400000);
	if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000)) > 3600000) hours = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000)) / 3600000);
	if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000)) > 60000) minutes = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000)) / 60000);
	if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000) - (minutes * 60000)) > 1000) seconds = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000) - (minutes * 60000)) / 1000);

	if (years) return `${years} years, ${months} months, ${days} days`;
	else if (months) return `${months} months, ${days} days, ${hours} hrs`;
	else if (days) return `${days} days, ${hours} hrs, ${minutes} min`;
	else if (hours) return `${hours} hrs, ${minutes} min, ${seconds} sec`;
	else if (minutes) return `${minutes} min, ${seconds} sec`;
	else return `${seconds} sec`;
}

function dmError(msg, error, debug) {
	console.error(error.stack);
	if (debug) embedScaffold(null, `Error sending direct message to ${msg.mentions.members.first()}.`, 'debug', 'More Information', '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)');
	else embedScaffold(msg.channel, `${msg.author} I can't send direct messages to you!`, 'msg', 'More Information', '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)');
}

function debugError(error, errorMsg, fieldTitle, fieldContent) {
	console.error(error.stack);
	embedScaffold(null, errorMsg, 'debug', fieldTitle, fieldContent);
}

function dmCmdError(msg, noPerms) {
	for (const property in cmdList) {
		if (msg.content.includes(cmdList[property]) && !noPerms) {
			embedScaffold(msg.author, 'That command cannot be used in DMs!', 'dm');
			return;
		}
	}

	embedScaffold(msg.author, 'Invalid command.', 'dm');
}

function embedScaffold(destination, errorMsg, channel, fieldTitle, fieldContent) {
	const botUser = bot.user;

	const embed = new Discord.MessageEmbed()
		.setAuthor(botUser.tag, botUser.avatarURL())
		.setColor(constObj.error)
		.setDescription(errorMsg)
		.setFooter(`${dateFormat(Date.now(), constObj.dateOutput)}`);

	if (fieldTitle) embed.addField(fieldTitle, fieldContent);

	if (channel === 'dm') destination.send(embed);
	else if (channel === 'debug') bot.channels.cache.get(constObj.debugID).send(embed);
	else if (channel === 'msg') destination.send(embed);
}

exports.initialise = initialise;
exports.constObj = constObj;
exports.cmdList = cmdList;
exports.cmdTxt = cmdTxt;
exports.dmCmds = dmCmds;
exports.helpObj = helpObj;
exports.rolesOutput = rolesOutput;
exports.capitalise = capitalise;
exports.sendErrorEmbed = sendErrorEmbed;
exports.formatAge = formatAge;
exports.dmError = dmError;
exports.debugError = debugError;
exports.dmCmdError = dmCmdError;
exports.errorScaffold = embedScaffold;