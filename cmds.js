'use strict';

const { ids: { devID } } = require('./config');
const { pCmd, rolesOutput } = require('./modules');

module.exports = async guild => {
	const { config: { prefix }, ids } = await require('./handlers/database')(guild);

	const cmds = {
		ping: {
			cmd: 'ping',
			aliases: ['p'],
			desc: 'Test the latency of the bot.',
			allowDM: true,
			roles: [],
			noRoles: [],
			devOnly: true,
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this, guild),
				});
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
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this, guild),
				});
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
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <code>`,
				});
			},
			get error() { return errorText(this.help, this.cmd); },
		},
		restart: {
			cmd: 'restart',
			aliases: ['new', 'kill', 'update'],
			desc: 'Restart the bot.',
			allowDM: true,
			roles: [],
			noRoles: [],
			devOnly: true,
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this, guild),
				});
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
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc.general,
					'Usage': `${pCmd(this, guild)} [command]`,
					'Examples': `\n${pCmd(this, guild)}\n${pCmd(this, guild)} ${cmds.leave.cmd}`,
				});
			},
		},
		leave: {
			cmd: 'leave',
			aliases: ['lv'],
			desc: 'Submit a leave request.',
			allowDM: false,
			roles: [],
			noRoles: ids.nonCadet,
			devOnly: false,
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <dates> <activity> <reason> [additional remarks]`,
					'Example': `${pCmd(this, guild)} 01 Jan for Parade Night due to an appointment`,
				});
			},
			get error() { return errorText(this.help, this.cmd); },
		},
		leaveFor: {
			cmd: 'leavefor',
			aliases: ['lv4'],
			desc: 'Submit a leave request for another cadet.',
			allowDM: false,
			roles: ids.tacPlus,
			noRoles: [],
			devOnly: false,
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <user> <dates> <activity> <reason> [additional remarks]`,
					'Example': `${pCmd(this, guild)} <@${devID}> 01 Jan for Parade Night due to an appointment`,
					'Allowed Roles': rolesOutput(this.roles, guild),
				});
			},
			get error() { return errorText(this.help, this.cmd); },
		},
		attendance: {
			cmd: 'attendance',
			aliases: ['att', 'attdnce'],
			desc: 'Submit an attendance register.',
			allowDM: false,
			roles: ids.tacPlus,
			noRoles: [],
			devOnly: false,
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `\n${pCmd(this, guild)} <message>\n${pCmd(this, guild)} update <message>`,
					'Allowed Roles': rolesOutput(this.roles, guild),
				});
			},
			get error() { return errorText(this.help, this.cmd); },
		},
		connected: {
			cmd: 'connected',
			aliases: ['cnnct', 'cnnctd'],
			desc: 'List the members connected to a voice channel.',
			allowDM: false,
			roles: ids.sgtPlus,
			noRoles: [],
			devOnly: false,
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <voice channel>`,
					'Example': `${pCmd(this, guild)} <#${ids.exampleVoiceID}>`,
					'Allowed Roles': rolesOutput(this.roles, guild),
				});
			},
			get error() { return errorText(this.help, this.cmd); },
		},
		archive: {
			cmd: 'archive',
			aliases: ['archv'],
			desc: 'Archive a text channel.',
			allowDM: false,
			roles: ids.cqmsPlus,
			noRoles: [],
			devOnly: false,
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <text channel>`,
					'Example': `${pCmd(this, guild)} <#${ids.exampleTextID}>`,
					'Allowed Roles': rolesOutput(this.roles, guild),
				});
			},
			get error() { return errorText(this.help, this.cmd); },
		},
		purge: {
			cmd: 'purge',
			aliases: ['del', 'delete', 'clear'],
			desc: 'Delete a number of messages from a channel.',
			allowDM: false,
			roles: ids.adjPlus,
			noRoles: [],
			devOnly: false,
			get help() {
				delete this.help;
				return this.help = helpText({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <count> [user]`,
					'Examples': `\n${pCmd(this, guild)} 10\n${pCmd(this, guild)} 5 <@${devID}>`,
					'Allowed Roles': rolesOutput(this.roles, guild),
				});
			},
			get error() { return errorText(this.help, this.cmd); },
		},
	};

	const cmdsList = {
		all: {
			type: 'role',
			ids: [ids.everyoneID],
			get cmds() {
				delete this.cmds;
				return this.cmds = commandText(this.ids, this.type);
			},
		},
		cdt: {
			type: 'noRole',
			ids: ids.nonCadet,
			get cmds() {
				delete this.cmds;
				return this.cmds = cmdsList.all.cmds + '\n' + commandText(this.ids, this.type);
			},
		},
		tac: {
			type: 'role',
			ids: ids.tacPlus,
			get cmds() {
				delete this.cmds;
				return this.cmds = cmdsList.cdt.cmds + '\n' + commandText(this.ids, this.type);
			},
		},
		sgt: {
			type: 'role',
			ids: ids.sgtPlus,
			get cmds() {
				delete this.cmds;
				return this.cmds = cmdsList.tac.cmds + '\n' + commandText(this.ids, this.type);
			},
		},
		cqms: {
			type: 'role',
			ids: ids.cqmsPlus,
			get cmds() {
				delete this.cmds;
				return this.cmds = cmdsList.sgt.cmds + '\n' + commandText(this.ids, this.type);
			},
		},
		adj: {
			type: 'role',
			ids: ids.adjPlus,
			get cmds() {
				delete this.cmds;
				return this.cmds = cmdsList.cqms.cmds + '\n' + commandText(this.ids, this.type);
			},
		},
		dev: {
			type: 'dev',
			ids: devID,
			get cmds() {
				delete this.cmds;
				return this.cmds = cmdsList.adj.cmds + '\n' + commandText(this.ids, this.type);
			},
		},
	};

	return { cmds: cmds, cmdsList: cmdsList };

	function commandText(tier, type) {
		const object = {};

		for (const cmd of Object.values(cmds)) {
			if ((type === 'role' && equals(cmd.roles, tier))
				|| (type === 'noRole' && equals(cmd.noRoles, tier))
				|| (type === 'dev' && cmd.devOnly)) {

				if (cmd === cmds.help) {
					object[`${pCmd(cmds.help, guild)}`] = cmds.help.desc.unqualified;
					object[`${pCmd(cmds.help, guild)} [command]`] = cmds.help.desc.qualified;
					continue;
				}

				object[`${pCmd(cmd, guild)}`] = cmd.desc;
			}
		}

		return helpText(object, true);
	}

	function helpText(object, forList) {
		let helpString = '';

		const [startFormat, endFormat] = (forList)
			? ['`', '` - ']
			: ['**', ':** '];

		for (const [key, value] of Object.entries(object)) {
			helpString += `${startFormat}${key}${endFormat}${value}\n`;
		}

		return helpString.replace(/\n+$/, '');
	}

	function errorText(helpTxt, cmd) {
		return '\n\n' + helpTxt + '\n' + helpText({
			'Help Command': `${pCmd(cmds.help, guild)} ${cmd}`,
		});
	}

	function pAls(cmd) {
		const als = [...cmd.aliases];
		for (let i = 0; i < als.length; i++) als[i] = `${prefix}${als[i]}`;
		return als.join(', ');
	}

	function equals(arr1, arr2) {
		if (arr1 === arr2) return true;
		if (arr1 === null || arr2 === null) return false;
		if (arr1.length !== arr2.length) return false;

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}

		return true;
	}
};