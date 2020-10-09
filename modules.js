'use strict';

const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('./config');
const { config: { prefix: pref, dateOutput }, ids: { serverID, devID, debugID, administratorID } } = config;
const { emojis: { errorEmoji }, colours } = config;

let bot;

const initialise = Client => bot = Client;

const pCmd = cmd => `${pref}${cmd.cmd}`;

const rolesOutput = (array, skipFormat) => {
	let rolesString = '';
	const filteredArray = array.filter(role => role !== administratorID && role.name !== '@everyone');

	for (let i = 0; i < filteredArray.length; i++) {
		if (i % 3 === 0) rolesString += '\n';
		if (skipFormat) rolesString += `${filteredArray[i]} `;
		else rolesString += `<@&${filteredArray[i]}> `;
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
	const memberRoles = (msg.guild) ? msg.member.roles.cache : server.members.cache.get(authorID).roles.cache;

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

	msg.channel.send(errorEmbed);
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

const dmError = (msg, error, debug) => {
	console.error(`\`\`\`${error.stack}\`\`\``);
	if (debug) embedScaffold(null, `Error sending direct message to ${msg.mentions.members.first()}.`, colours.error, 'debug', 'More Information', '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)');
	else embedScaffold(msg.channel, `${msg.author} I can't send direct messages to you!`, colours.error, 'msg', 'More Information', '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)');
};

const debugError = (error, errorMsg, fieldTitle, fieldContent) => {
	console.error(`\`\`\`${error.stack}\`\`\``);
	embedScaffold(null, errorMsg, colours.error, 'debug', fieldTitle, fieldContent);
};

const dmCmdError = (msg, type) => {
	const server = bot.guilds.cache.get(serverID);
	const errorEmojiObj = server.emojis.cache.find(emoji => emoji.name === errorEmoji);
	msg.react(errorEmojiObj).catch(error => debugError(error, 'Error reacting to message in DMs.'));
	if (type === 'noPerms') embedScaffold(msg.author, 'You do not have access to that command.', colours.error, 'dm');
	else if (type === 'hasRole') embedScaffold(msg.author, 'Please use a server channel for that command.', colours.error, 'dm');
	else if (type === 'noDM') embedScaffold(msg.author, 'That command cannot be used in DMs.', colours.error, 'dm');
	else embedScaffold(msg.author, 'Invalid command.', colours.error, 'dm');
};

const embedScaffold = (destination, descMsg, colour, channel, fieldTitle, fieldContent) => {
	const botUser = bot.user;

	const embed = new Discord.MessageEmbed()
		.setAuthor(botUser.tag, botUser.avatarURL())
		.setColor(colour)
		.setDescription(descMsg)
		.setFooter(`${dateFormat(Date.now(), dateOutput)}`);

	if (fieldTitle) embed.addField(fieldTitle, fieldContent);

	if (channel === 'dm') destination.send(embed);
	else if (channel === 'debug') bot.channels.cache.get(debugID).send(embed);
	else if (channel === 'msg') destination.send(embed);
};

module.exports = {
	initialise: initialise,
	pCmd: pCmd,
	rolesOutput: rolesOutput,
	capitalise: capitalise,
	cmdPermsCheck: cmdPermsCheck,
	cmdError: cmdError,
	formatAge: formatAge,
	dmError: dmError,
	debugError: debugError,
	dmCmdError: dmCmdError,
	embedScaffold: embedScaffold,
};