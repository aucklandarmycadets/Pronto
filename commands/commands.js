'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { ids: { DEVELOPER_ID } } = require('./config');
const { formatList } = require('./modules');

/**
 * @namespace commands
 */

/**
 * @typedef {string} commands.CommandName The name of the command
 */

/**
 * @typedef {Object} commands.CommandBase The base of each of Pronto's commands, with the base properties to construct a complete [\<Command>]{@link commands.Command}
 * @property {commands.CommandName} command The name of the command
 * @property {string[]} aliases The aliases for the command
 * @property {string} description The description of the command
 * @property {boolean} allowDirect Whether to allow the command to execute from a direct message
 * @property {Discord.Snowflake[]} requiredRoles A <Role.id[]> of which the \<GuildMember> must have at least one to execute the command
 * @property {Discord.Snowflake[]} deniedRoles A <Role.id[]> of which the \<GuildMember> must have none to execute the command
 * @property {boolean} developerOnly Whether the command is only executable by the developer defined by config.ids.DEVELOPER_ID
 * @property {boolean} displayInList Whether to display the command in the guild's commands list
 * @property {string} help The help text to display for the command
 * @property {?string} error The error text to display for the command
*/

/**
 * @typedef {Object.<commands.CommandName, commands.CommandBase>} commands.CommandsBase The base of Pronto's commands object, where each [\<CommandBase>]{@link commands.CommandBase} is stored in the \<CommandsBase> object under the property [{@link commands.CommandName|CommandName}]
 */

/**
 * @typedef {commands.CommandBase} commands.Command The complete \<Command> object for one of Pronto's commands, with a [\<Command.execute()>]{@link commands.Execute} method
 * @property {commands.Execute} execute The command's [\<Command.execute()>]{@link commands.Execute} method
 */

/**
 * @typedef {Object.<commands.CommandName, commands.Command>} commands.Commands The complete \<Commands> object for all of Pronto's commands, where each [\<Command>]{@link commands.Command} is stored in the \<Commands> object under the property [{@link commands.CommandName|CommandName}]
 */

/**
 * @typedef {Function} commands.Execute A command's \<Command.execute()> method
 * @param {commands.CommandParameters} parameters The [\<CommandParameters>]{@link commands.CommandParameters} to execute this command
 * @returns {Promise<void | Typings.Lesson>} Void, or the [\<Lesson>]{@link models.Lesson} object
 */

/**
 * @typedef {Object} commands.CommandParameters An \<Object> of the valid parameters accepted by the [\<Command.execute()>]{@link commands.Execute} method
 * @property {Discord.Message} msg The \<Message> that executed the command, or the \<Message> that the reaction collector was attached to
 * @property {?string[]} args The \<string[]> containing the command arguments
 * @property {?string} msgCommand The message argument that was parsed to this [\<CommandBase>]{@link commands.CommandBase}, i.e. either \<CommandBase.command> or \<CommandBase.aliases.includes(msgCommand)>
 * @property {?Discord.User} user The \<User> that triggered the reaction collector
 */

/**
 *
 * @param {Discord.Guild | 'BREAK'} guild
 * @returns
 */
module.exports = async guild => {
	const { settings: { prefix }, ids } = (guild === 'BREAK')
		? require('./config')
		: await require('./handlers/database')(guild);

	const commands = {
		ping: {
			command: 'ping',
			aliases: ['p'],
			description: 'Test the latency of the bot.',
			allowDirect: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': prefixCommand(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
		},
		uptime: {
			command: 'uptime',
			aliases: ['up'],
			description: 'Time since last restart.',
			allowDirect: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': prefixCommand(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
		},
		evaluate: {
			command: 'evaluate',
			aliases: ['eval'],
			description: 'Evaluate Javascript code.',
			allowDirect: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': `${prefixCommand(this)} <code>`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		restart: {
			command: 'restart',
			aliases: ['new', 'kill', 'update'],
			description: 'Restart the bot.',
			allowDirect: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': prefixCommand(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
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
					'Aliases': prefixAlias(this),
					'Description': this.description.general,
					'Usage': `${prefixCommand(this)} [command]`,
					'Examples': `\n${prefixCommand(this)}\n${prefixCommand(this)} ${commands.leave.command}`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		leave: {
			command: 'leave',
			aliases: ['lv'],
			description: 'Submit a leave request.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': `${prefixCommand(this)} <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${prefixCommand(this)} 01 Jan for Parade Night due to an appointment`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		lesson: {
			command: 'lesson',
			aliases: ['view', 'add', 'remove', 'submit'],
			description: 'Commands to aid in actioning an assigned lesson.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: false,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': prefixCommand(this),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		seen: {
			command: 'seen',
			aliases: ['ack'],
			description: 'Acknowledge receipt of a lesson warning.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: false,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': prefixCommand(this),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		leaveFor: {
			command: 'leavefor',
			aliases: ['lv4'],
			description: 'Submit a leave request for another cadet.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': `${prefixCommand(this)} <user> <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${prefixCommand(this)} <@${DEVELOPER_ID}> 01 Jan for Parade Night due to an appointment`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		attendance: {
			command: 'attendance',
			aliases: ['att', 'attdnce'],
			description: 'Submit an attendance register.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': `\n${prefixCommand(this)} <message>`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		connected: {
			command: 'connected',
			aliases: ['cnnct', 'cnnctd'],
			description: 'List the members connected to a voice channel.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': `${prefixCommand(this)} <voice channel>`,
					'Example': `${prefixCommand(this)} #example-voice`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		assign: {
			command: 'assign',
			aliases: ['give'],
			description: 'Assign a lesson to an instructor.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': `${prefixCommand(this)} <user(s)>`,
					'Example': `${prefixCommand(this)} <@${DEVELOPER_ID}>`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		approve: {
			command: 'approve',
			aliases: ['app', 'apprv', 'acc', 'accept'],
			description: 'Approve a lesson plan.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': prefixCommand(this),
					'Allowed Roles': rolesOutput(this.requiredRoles),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		archive: {
			command: 'archive',
			aliases: ['archv'],
			description: 'Archive a text channel.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': `${prefixCommand(this)} <text channel>`,
					'Example': `${prefixCommand(this)} #example-text`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
		purge: {
			command: 'purge',
			aliases: ['del', 'delete', 'clear'],
			description: 'Delete a number of messages from a channel.',
			allowDirect: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			displayInList: true,
			get help() {
				return formatList({
					'Aliases': prefixAlias(this),
					'Description': this.description,
					'Usage': `${prefixCommand(this)} <count> [user]`,
					'Examples': `\n${prefixCommand(this)} 10\n${prefixCommand(this)} 5 <@${DEVELOPER_ID}>`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.command);
			},
			set error(value) {
				errorText(this.help, this.command);
			},
		},
	};

	return commands;

	function rolesOutput(array) {
		return (array)
			? array.filter(id => id !== ids.administratorID && id !== ids.everyoneID)
				.reduce((mentions, id, i) => mentions + `${(i % 3 === 0) ? '\n' : ''}<@&${id}> `, '')
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

	function prefixAlias(command) {
		return [...command.aliases]
			.map(alias => prefix + alias)
			.join(', ');
	}
};