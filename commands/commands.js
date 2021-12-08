'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { ids: { DEVELOPER_ID } } = require('../config');
const { formatList } = require('../modules');
const { database } = require('../handlers');

/**
 * @namespace commands
 */

/**
 * @typedef {string} commands.CommandName The name of the command
 */

/**
 * @typedef {Object} commands.CommandDescription The description of the command, which may differ depending on whether the message command is qualified with a different [\<CommandName>]{@link commands.CommandName} as an argument
 * @property {string} general The description of the command, or the description to display in the command's base help text if the command supports a dynamic description
 * @property {?string} unqualified The description to display as the command's base description if the command supports a dynamic description
 * @property {?string} qualified The description to display as the command's description if qualified with a different [\<CommandName>]{@link commands.CommandName}, if the command supports a dynamic description
 */

/**
 * @typedef {Object} commands.BaseCommand The base of each of Pronto's commands, with the base properties to construct a complete [\<Command>]{@link commands.Command}
 * @property {commands.CommandName} command The name of the command
 * @property {string[]} aliases The aliases for the command
 * @property {commands.CommandDescription} description The [\<CommandDescription>]{@link commands.CommandDescription} object of the command
 * @property {boolean} allowDirect Whether to allow the command to execute from a direct message
 * @property {Discord.Snowflake[]} requiredRoles A \<Role.id[]> of which the \<GuildMember> must have at least one to execute the command
 * @property {Discord.Snowflake[]} deniedRoles A \<Role.id[]> of which the \<GuildMember> must have none to execute the command
 * @property {boolean} developerOnly Whether the command is only executable by the developer defined by [`config.ids.DEVELOPER_ID`]{@link config.Configuration}
 * @property {boolean} displayInList Whether to display the command in the guild's commands list
 * @property {Readonly<string>} help The help text to display for the command
 * @property {Readonly<?string>} error The error text to display for the command
 */

/**
 * @typedef {Object.<commands.CommandName, commands.BaseCommand>} commands.BaseCommands The base of Pronto's commands object, where each [\<BaseCommand>]{@link commands.BaseCommand} is stored in the \<BaseCommands> object under the property [{@link commands.CommandName|CommandName}]
 */

/**
 * @typedef {commands.BaseCommand} commands.Command The complete \<Command> object for one of Pronto's commands, with a [\<Command.execute()>]{@link commands.CommandExecute} method
 * @property {commands.CommandExecute} execute The command's [\<Command.execute()>]{@link commands.CommandExecute} method
 */

/**
 * @typedef {Object.<commands.CommandName, commands.Command>} commands.Commands The complete \<Commands> object for all of Pronto's commands, where each [\<Command>]{@link commands.Command} is stored in the \<Commands> object under the property [{@link commands.CommandName|CommandName}]
 */

/**
 * @typedef {Function} commands.CommandExecute A command's \<Command.execute()> method
 * @param {commands.CommandParameters} parameters The [\<CommandParameters>]{@link commands.CommandParameters} to execute this command
 * @returns {Promise<void | Typings.Lesson>} Void, or the [\<Lesson>]{@link models.Lesson} object
 */

/**
 * @typedef {Object} commands.CommandParameters An \<Object> of the valid parameters accepted by the [\<Command.execute()>]{@link commands.CommandExecute} method
 * @property {Discord.Message} msg The \<Message> that executed the \<Command>, or the \<Message> that the reaction collector was attached to
 * @property {?string[]} args The \<string[]> containing the command arguments
 * @property {?string} msgCommand The message argument that was parsed to this [\<BaseCommand>]{@link commands.BaseCommand}, i.e. either \<BaseCommand.command> or \<BaseCommand.aliases.includes(msgCommand)>
 * @property {?Discord.User} user The \<User> that triggered the reaction collector
 */

/**
 *
 * @param {Discord.Guild} guild
 * @returns {Promise<Typings.BaseCommands>}
 */
module.exports = async guild => {
	const { settings: { prefix }, ids } = await database(guild);

	/**
	 * @type {Typings.BaseCommands}
	 */
	const commands = {
		ping: {
			command: 'ping',
			aliases: ['p'],
			description: {
				general: 'Test the latency of the bot.',
			},
			allowDirect: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': prefixCommand(this),
				});
			},
		},
		uptime: {
			command: 'uptime',
			aliases: ['up'],
			description: {
				general: 'Time since last restart.',
			},
			allowDirect: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': prefixCommand(this),
				});
			},
		},
		evaluate: {
			command: 'evaluate',
			aliases: ['eval'],
			description: {
				general: 'Evaluate Javascript code.',
			},
			allowDirect: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} <code>`,
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		restart: {
			command: 'restart',
			aliases: ['new', 'kill', 'update'],
			description: {
				general: 'Restart the bot.',
			},
			allowDirect: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': prefixCommand(this),
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		help: {
			command: 'help',
			aliases: ['cmd', 'cmds', 'command', 'commands'],
			description: {
				general: 'Get help with using Pronto.',
				unqualified: 'List of the commands you can use.',
				qualified: 'Get help with a specific command.',
			},
			allowDirect: true,
			requiredRoles: [ids.everyoneID],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} [command]`,
					'Examples': `\n${prefixCommand(this)}\n${prefixCommand(this)} ${commands.leave.command}`,
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		leave: {
			command: 'leave',
			aliases: ['lv'],
			description: {
				general: 'Submit a leave request.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${prefixCommand(this)} 01 Jan for Parade Night due to an appointment`,
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		lesson: {
			command: 'lesson',
			aliases: ['view', 'add', 'remove', 'submit'],
			description: {
				general: 'Commands to aid in actioning an assigned lesson.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: false,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': prefixCommand(this),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		seen: {
			command: 'seen',
			aliases: ['ack'],
			description: {
				general: 'Acknowledge receipt of a lesson warning.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: false,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': prefixCommand(this),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		leaveFor: {
			command: 'leavefor',
			aliases: ['lv4'],
			description: {
				general: 'Submit a leave request for another cadet.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} <user> <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${prefixCommand(this)} <@${DEVELOPER_ID}> 01 Jan for Parade Night due to an appointment`,
					'Allowed Roles': formatRoles(this.requiredRoles),
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		attendance: {
			command: 'attendance',
			aliases: ['att', 'attdnce'],
			description: {
				general: 'Submit an attendance register.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `\n${prefixCommand(this)} <message>`,
					'Allowed Roles': formatRoles(this.requiredRoles),
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		connected: {
			command: 'connected',
			aliases: ['cnnct', 'cnnctd'],
			description: {
				general: 'List the members connected to a voice channel.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} <voice channel>`,
					'Example': `${prefixCommand(this)} #example-voice`,
					'Allowed Roles': formatRoles(this.requiredRoles),
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		assign: {
			command: 'assign',
			aliases: ['give'],
			description: {
				general: 'Assign a lesson to an instructor.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} <user(s)>`,
					'Example': `${prefixCommand(this)} <@${DEVELOPER_ID}>`,
					'Allowed Roles': formatRoles(this.requiredRoles),
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		approve: {
			command: 'approve',
			aliases: ['app', 'apprv', 'acc', 'accept'],
			description: {
				general: 'Approve a lesson plan.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': prefixCommand(this),
					'Allowed Roles': formatRoles(this.requiredRoles),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		archive: {
			command: 'archive',
			aliases: ['archv'],
			description: {
				general: 'Archive a text channel.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} <text channel>`,
					'Example': `${prefixCommand(this)} #example-text`,
					'Allowed Roles': formatRoles(this.requiredRoles),
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
		purge: {
			command: 'purge',
			aliases: ['del', 'delete', 'clear'],
			description: {
				general: 'Delete a number of messages from a channel.',
			},
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAliases(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} <count> [user]`,
					'Examples': `\n${prefixCommand(this)} 10\n${prefixCommand(this)} 5 <@${DEVELOPER_ID}>`,
					'Allowed Roles': formatRoles(this.requiredRoles),
				});
			},
			get error() {
				return errorText(this.help, this.command);
			},
		},
	};

	return commands;

	function formatRoles(array) {
		return (array)
			? array.filter(roleID => roleID !== ids.administratorID && roleID !== ids.everyoneID)
				.reduce((mentions, roleID, i) => mentions + `${(i % 3 === 0) ? '\n' : ''}<@&${roleID}> `, '')
			: '';
	}

	function errorText(helpText, command) {
		return '\n\n' + helpText + '\n' + formatList({
			'Help Command': `${prefixCommand(commands.help)} ${command}`,
		});
	}

	function prefixCommand(command) {
		return `${prefix}${command.command}`;
	}

	function prefixAliases(command) {
		return [...command.aliases]
			.map(alias => prefix + alias)
			.join(', ');
	}
};