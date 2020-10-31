'use strict';

const Discord = require('discord.js');
const { ids: { devID } } = require('../config');
const { delMsg, dmCmdError, embedScaffold, errorReact, formatList, getRoleError, pCmd, sendDM, sendMsg, successReact } = require('../modules');
const { permissionsHandler } = require('../handlers');

module.exports = async guild => {
	const { help, ...cmds } = await require('../cmds')(guild);
	const { config: { prontoLogo }, ids: { serverID, adjPlus }, colours } = await require('../handlers/database')(guild);

	help.execute = async (msg, args) => {
		const { bot } = require('../pronto');

		const server = bot.guilds.cache.get(serverID);
		const helpEmbed = new Discord.MessageEmbed();
		const msgCmd = args[0]
			? args[0].toLowerCase()
			: null;

		if (!msg.guild && !server.available) {
			errorReact(msg);
			return embedScaffold(msg.author, 'There was an error reaching the server, please try again later.', colours.error, 'dm');
		}

		const memberRoles = (msg.guild)
			? msg.member.roles.cache
			: await server.members.fetch(msg.author.id).then(member => member.roles.cache);

		if (!memberRoles) return getRoleError(msg);

		if (msg.guild) delMsg(msg);

		const cmd = bot.commands.get(msgCmd) || bot.commands.find(command => command.aliases && command.aliases.includes(msgCmd));

		(cmd)
			? await permissionsHandler(msg, cmd)
				? sendHelpEmbed(cmd)
				: (msg.guild)
					? sendCmdList()
					: dmCmdError(msg, 'noPerms')
			: sendCmdList();

		async function sendHelpEmbed(command) {
			helpEmbed.setTitle(`Command: ${await pCmd(command, guild)}`);
			helpEmbed.setColor(colours.pronto);
			helpEmbed.setDescription(command.help);

			if (msg.guild) {
				helpEmbed.setFooter(`Requested by ${msg.member.displayName}`);
				return sendMsg(msg.channel, helpEmbed);
			}

			else if (!helpEmbed.description.includes('Allowed Roles')) {
				successReact(msg);
				return sendDM(msg.author, helpEmbed, msg.channel);
			}

			else return dmCmdError(msg, 'hasRole');
		}

		async function sendCmdList() {
			const obj = {
				[await pCmd(help, guild)]: help.desc.unqualified,
				[`${await pCmd(help, guild)} [command]`]: help.desc.qualified,
			};

			for (const command of Object.values(cmds)) {
				if (await permissionsHandler(msg, command)) obj[`${await pCmd(command, guild)}`] = command.desc;
			}

			const commandsList = formatList(obj, true);

			const james = await bot.users.fetch('192181901065322496');

			if (!msg.guild && msgCmd) errorReact(msg);

			else if (!msg.guild) successReact(msg);

			helpEmbed.setTitle('Commands List');
			helpEmbed.setThumbnail(prontoLogo);
			helpEmbed.setColor(colours.pronto);
			helpEmbed.setDescription(commandsList);
			helpEmbed.setFooter(`Developed by ${james.tag}`, james.avatarURL());

			if (!memberRoles.some(roles => adjPlus.includes(roles.id)) && msg.author.id !== devID) {
				helpEmbed.addField('Note', `Only displaying commands available to ${msg.author}.`);
			}

			sendDM(msg.author, helpEmbed, msg.channel);
		}
	};

	return help;
};