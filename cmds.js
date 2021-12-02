'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

const { ids: { DEVELOPER_ID } } = require('./config');
const { formatList } = require('./modules');

/**
 *
 * @param {Discord.Guild | 'BREAK'} guild
 * @returns
 */
module.exports = async guild => {
	const { settings: { prefix }, ids } = (guild === 'BREAK')
		? require('./config')
		: await require('./handlers/database')(guild);

	const cmds = {
		ping: {
			cmd: 'ping',
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
					'Usage': prefixCmd(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
		},
		uptime: {
			cmd: 'uptime',
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
					'Usage': prefixCmd(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
		},
		evaluate: {
			cmd: 'evaluate',
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
					'Usage': `${prefixCmd(this)} <code>`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		restart: {
			cmd: 'restart',
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
					'Usage': prefixCmd(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		help: {
			cmd: 'help',
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
					'Usage': `${prefixCmd(this)} [command]`,
					'Examples': `\n${prefixCmd(this)}\n${prefixCmd(this)} ${cmds.leave.cmd}`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		leave: {
			cmd: 'leave',
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
					'Usage': `${prefixCmd(this)} <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${prefixCmd(this)} 01 Jan for Parade Night due to an appointment`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		lesson: {
			cmd: 'lesson',
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
					'Usage': prefixCmd(this),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		seen: {
			cmd: 'seen',
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
					'Usage': prefixCmd(this),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		leaveFor: {
			cmd: 'leavefor',
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
					'Usage': `${prefixCmd(this)} <user> <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${prefixCmd(this)} <@${DEVELOPER_ID}> 01 Jan for Parade Night due to an appointment`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		attendance: {
			cmd: 'attendance',
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
					'Usage': `\n${prefixCmd(this)} <message>`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		connected: {
			cmd: 'connected',
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
					'Usage': `${prefixCmd(this)} <voice channel>`,
					'Example': `${prefixCmd(this)} #example-voice`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		assign: {
			cmd: 'assign',
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
					'Usage': `${prefixCmd(this)} <user(s)>`,
					'Example': `${prefixCmd(this)} <@${DEVELOPER_ID}>`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		approve: {
			cmd: 'approve',
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
					'Usage': prefixCmd(this),
					'Allowed Roles': rolesOutput(this.requiredRoles),
					'Allowed Categories': `<#${ids.lessonsID}>`,
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		archive: {
			cmd: 'archive',
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
					'Usage': `${prefixCmd(this)} <text channel>`,
					'Example': `${prefixCmd(this)} #example-text`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
		purge: {
			cmd: 'purge',
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
					'Usage': `${prefixCmd(this)} <count> [user]`,
					'Examples': `\n${prefixCmd(this)} 10\n${prefixCmd(this)} 5 <@${DEVELOPER_ID}>`,
					'Allowed Roles': rolesOutput(this.requiredRoles),
				});
			},
			set help(obj) {
				formatList(obj);
			},
			get error() {
				return errorText(this.help, this.cmd);
			},
			set error(value) {
				errorText(this.help, this.cmd);
			},
		},
	};

	return cmds;

	function rolesOutput(array) {
		return (array)
			? array.filter(id => id !== ids.administratorID && id !== ids.everyoneID)
				.reduce((mentions, id, i) => mentions + `${(i % 3 === 0) ? '\n' : ''}<@&${id}> `, '')
			: '';
	}

	function errorText(helpTxt, cmd) {
		return '\n\n' + helpTxt + '\n' + formatList({
			'Help Command': `${prefixCmd(cmds.help)} ${cmd}`,
		});
	}

	function prefixCmd(cmd) {
		return `${prefix}${cmd.cmd}`;
	}

	function prefixAlias(cmd) {
		return [...cmd.aliases]
			.map(alias => prefix + alias)
			.join(', ');
	}
};