'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

const { ids: { DEVELOPER_ID } } = require('./config');
const { formatList } = require('./modules');

/**
 * @namespace commands
 */

/**
 * @typedef {Object} commands.CommandParameters An \<Object> of the valid parameters accepted by the \<Command.execute()> method
 * @property {Discord.Message} msg The \<Message> that executed the command, or the \<Message> that the reaction collector was attached to
 * @property {?string[]} args The \<string[]> containing the command arguments
 * @property {?string} msgCommand The message argument that was parsed to this \<CommandBase>, i.e. either \<CommandBase.command> or \<CommandBase.aliases.includes(msgCommand)>
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
			allowDM: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			showList: true,
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
			allowDM: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			showList: true,
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
			allowDM: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			showList: true,
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
			allowDM: true,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: true,
			showList: true,
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
			allowDM: true,
			requiredRoles: [ids.everyoneID],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: false,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: false,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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
			allowDM: false,
			requiredRoles: [],
			deniedRoles: [],
			developerOnly: false,
			showList: true,
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