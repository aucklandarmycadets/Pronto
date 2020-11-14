'use strict';

const { ids: { devID } } = require('./config');
const { formatList } = require('./modules');

module.exports = async guild => {
	const { config: { prefix }, ids } = (guild === 'break')
		? require('./config')
		: await require('./handlers/database')(guild);

	const cmds = {
		ping: {
			cmd: 'ping',
			aliases: ['p'],
			desc: 'Test the latency of the bot.',
			allowDM: true,
			roles: [],
			noRoles: [],
			devOnly: true,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
		},
		uptime: {
			cmd: 'uptime',
			aliases: ['up'],
			desc: 'Time since last restart.',
			allowDM: true,
			roles: [],
			noRoles: [],
			devOnly: true,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
				});
			},
			set help(obj) {
				formatList(obj);
			},
		},
		evaluate: {
			cmd: 'evaluate',
			aliases: ['eval'],
			desc: 'Evaluate Javascript code.',
			allowDM: true,
			roles: [],
			noRoles: [],
			devOnly: true,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} <code>`,
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
			desc: 'Restart the bot.',
			allowDM: true,
			roles: [],
			noRoles: [],
			devOnly: true,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
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
			desc: {
				general: 'Get help with using Pronto.',
				unqualified: 'List of the commands you can use.',
				qualified: 'Get help with a specific command.',
			},
			allowDM: true,
			roles: [ids.everyoneID],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc.general,
					'Usage': `${pCmd(this)} [command]`,
					'Examples': `\n${pCmd(this)}\n${pCmd(this)} ${cmds.leave.cmd}`,
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
			desc: 'Submit a leave request.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${pCmd(this)} 01 Jan for Parade Night due to an appointment`,
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
			desc: 'Commands to help action an assigned lesson.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: false,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
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
			desc: 'Acknowledge receipt of a lesson warning.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: false,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
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
			desc: 'Submit a leave request for another cadet.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} <user> <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${pCmd(this)} <@${devID}> 01 Jan for Parade Night due to an appointment`,
					'Allowed Roles': rolesOutput(this.roles),
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
			desc: 'Submit an attendance register.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `\n${pCmd(this)} <message>\n${pCmd(this)} update <message>`,
					'Allowed Roles': rolesOutput(this.roles),
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
			desc: 'List the members connected to a voice channel.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} <voice channel>`,
					'Example': `${pCmd(this)} #example-voice`,
					'Allowed Roles': rolesOutput(this.roles),
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
			desc: 'Assign a lesson to an instructor.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} <user(s)>`,
					'Example': `${pCmd(this)} <@${devID}>`,
					'Allowed Roles': rolesOutput(this.roles),
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
			desc: 'Approve a lesson plan.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this),
					'Allowed Roles': rolesOutput(this.roles),
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
			desc: 'Archive a text channel.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} <text channel>`,
					'Example': `${pCmd(this)} #example-text`,
					'Allowed Roles': rolesOutput(this.roles),
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
			desc: 'Delete a number of messages from a channel.',
			allowDM: false,
			roles: [],
			noRoles: [],
			devOnly: false,
			showList: true,
			get help() {
				return formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this)} <count> [user]`,
					'Examples': `\n${pCmd(this)} 10\n${pCmd(this)} 5 <@${devID}>`,
					'Allowed Roles': rolesOutput(this.roles),
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
		let rolesString = '';

		if (!array) return rolesString;

		const filteredArray = array.filter(id => id !== ids.administratorID && id !== ids.everyoneID);

		for (let i = 0; i < filteredArray.length; i++) {
			if (i % 3 === 0) rolesString += '\n';

			rolesString += `<@&${filteredArray[i]}> `;
		}

		return rolesString;
	}

	function errorText(helpTxt, cmd) {
		return '\n\n' + helpTxt + '\n' + formatList({
			'Help Command': `${pCmd(cmds.help)} ${cmd}`,
		});
	}

	function pCmd(cmd) {
		return `${prefix}${cmd.cmd}`;
	}

	function pAls(cmd) {
		const als = [...cmd.aliases];
		for (let i = 0; i < als.length; i++) als[i] = `${prefix}${als[i]}`;
		return als.join(', ');
	}
};