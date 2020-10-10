'use strict';

const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('./config');
const { config: { prefix: pref, dateOutput }, ids: { serverID, devID, debugID, administratorID } } = config;
const { emojis: { errorEmoji }, colours } = config;

let bot, version;

const initialise = (Client, ver) => {
	bot = Client;
	version = ver;
};

const pCmd = cmd => `${pref}${cmd.cmd}`;

const rolesOutput = (array, skipFormat) => {
	let rolesString = '';
	const filteredArray = array.filter(role => role !== administratorID && role.name !== '@everyone');

	for (let i = 0; i < filteredArray.length; i++) {
		if (i % 3 === 0) rolesString += '\n';

		(skipFormat)
			? rolesString += `${filteredArray[i]} `
			: rolesString += `<@&${filteredArray[i]}> `;
	}

	return rolesString;
};

const capitalise = string => {
	if (typeof string !== 'string') return '';
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const cmdPermsCheck = (msg, cmd) => {
	const server = bot.guilds.cache.get(serverID);
	const authorID = msg.author.id;

	const memberRoles = (msg.guild)
		? msg.member.roles.cache
		: server.members.cache.get(authorID).roles.cache;

	if ((cmd.noRoles.length && memberRoles.some(roles => cmd.noRoles.includes(roles.id)))
		|| (cmd.roles.length && !memberRoles.some(roles => cmd.roles.includes(roles.id)))
		|| (cmd.devOnly && authorID !== devID)) {
		return false;
	}

	return true;
};

const cmdError = (msg, errMsg, cmdErr, footer) => {
	const errorEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === errorEmoji);
	msg.react(errorEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

	const errorEmbed = new Discord.MessageEmbed()
		.setColor(colours.error)
		.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
		.setDescription(`${msg.author} ${errMsg} ${cmdErr}`);

	if (footer) errorEmbed.setFooter(footer);

	sendMsg(msg.channel, errorEmbed);
};

const formatAge = raw => {
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
};

const sendMsg = (dest, msg, isDM) => {
	const type = (isDM)
		? 'DM'
		: 'message';

	dest.send(msg).catch(error => debugError(error, `Error sending ${type} to ${dest}.`));
};

const dmError = (msg, error, debug) => {
	const member = msg.mentions.members.first();
	const support = '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)';

	console.error(error);

	if (debug) embedScaffold(null, `Error sending direct message to ${member}.`, colours.error, 'debug', 'More Information', support, `\`\`\`js\n${error.stack}\`\`\``);
	else embedScaffold(msg.channel, `${msg.author} I can't send direct messages to you!`, colours.error, 'msg', 'More Information', support);
};

const debugError = (error, errorMsg, fieldTitle, fieldContent) => {
	console.error(error);
	embedScaffold(null, errorMsg, colours.error, 'debug', fieldTitle, fieldContent, `\`\`\`js\n${error.stack}\`\`\``);
};

const dmCmdError = (msg, type) => {
	const server = bot.guilds.cache.get(serverID);
	const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);
	msg.react(errorEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));

	try {
		if (type === 'noPerms') throw 'You do not have access to that command.';
		else if (type === 'hasRole') throw 'Please use a server channel for that command.';
		else if (type === 'noDM') throw 'That command cannot be used in DMs.';
		else throw 'Invalid command.';
	}

	catch(error) { embedScaffold(msg.author, error, colours.error, 'dm'); }
};

const embedScaffold = (dest, descMsg, colour, type, fieldTitle, fieldContent, errorField) => {
	const botUser = bot.user;
	const debugChannel = bot.channels.cache.get(debugID);
	const devFooter = (type === 'dev')
		? ` | Pronto v${version}`
		: '';

	const embed = new Discord.MessageEmbed()
		.setAuthor(botUser.tag, botUser.avatarURL())
		.setColor(colour)
		.setDescription(descMsg)
		.setFooter(`${dateFormat(Date.now(), dateOutput)}${devFooter}`);

	if (fieldTitle) embed.addField(fieldTitle, fieldContent);
	if (errorField) embed.setDescription(`${descMsg}\n${errorField}`);

	if (type === 'dm') sendMsg(dest, embed, true);
	else if (type === 'dev') sendMsg(dest, embed, true);
	else if (type === 'msg') sendMsg(dest, embed);
	else if (type === 'debug') debugChannel.send(embed).catch(error => console.error(error));
};

module.exports = {
	initialise: initialise,
	pCmd: pCmd,
	rolesOutput: rolesOutput,
	capitalise: capitalise,
	cmdPermsCheck: cmdPermsCheck,
	sendMsg: sendMsg,
	cmdError: cmdError,
	formatAge: formatAge,
	dmError: dmError,
	debugError: debugError,
	dmCmdError: dmCmdError,
	embedScaffold: embedScaffold,
};