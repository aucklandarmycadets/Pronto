'use strict';

const { ids: { devID } } = require('./config');
const { formatList } = require('./modules');

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
				return this.help = formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': pCmd(this, guild, prefix),
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
				return this.help = formatList({
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
				return this.help = formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <code>`,
				});
			},
			get error() {
				delete this.error;
				return this.error = errorText(this.help, this.cmd);
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
			get help() {
				delete this.help;
				return this.help = formatList({
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
				return this.help = formatList({
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
			noRoles: [],
			devOnly: false,
			get help() {
				delete this.help;
				return this.help = formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${pCmd(this, guild)} 01 Jan for Parade Night due to an appointment`,
				});
			},
			get error() {
				delete this.error;
				return this.error = errorText(this.help, this.cmd);
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
			get help() {
				delete this.help;
				return this.help = formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <user> <date(s)> <activity> <reason> [additional remarks]`,
					'Example': `${pCmd(this, guild)} <@${devID}> 01 Jan for Parade Night due to an appointment`,
					'Allowed Roles': rolesOutput(this.roles),
				});
			},
			get error() {
				delete this.error;
				return this.error = errorText(this.help, this.cmd);
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
			get help() {
				delete this.help;
				return this.help = formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `\n${pCmd(this, guild)} <message>\n${pCmd(this, guild)} update <message>`,
					'Allowed Roles': rolesOutput(this.roles),
				});
			},
			get error() {
				delete this.error;
				return this.error = errorText(this.help, this.cmd);
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
			get help() {
				delete this.help;
				return this.help = formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <voice channel>`,
					'Example': `${pCmd(this, guild)} <#${ids.exampleVoiceID}>`,
					'Allowed Roles': rolesOutput(this.roles),
				});
			},
			get error() {
				delete this.error;
				return this.error = errorText(this.help, this.cmd);
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
			get help() {
				delete this.help;
				return this.help = formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <text channel>`,
					'Example': `${pCmd(this, guild)} <#${ids.exampleTextID}>`,
					'Allowed Roles': rolesOutput(this.roles),
				});
			},
			get error() {
				delete this.error;
				return this.error = errorText(this.help, this.cmd);
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
			get help() {
				delete this.help;
				return this.help = formatList({
					'Aliases': pAls(this),
					'Description': this.desc,
					'Usage': `${pCmd(this, guild)} <count> [user]`,
					'Examples': `\n${pCmd(this, guild)} 10\n${pCmd(this, guild)} 5 <@${devID}>`,
					'Allowed Roles': rolesOutput(this.roles),
				});
			},
			get error() {
				delete this.error;
				return this.error = errorText(this.help, this.cmd);
			},
		},
	};

	return cmds;

	function rolesOutput(array) {
		let rolesString = '';

		if (!array) return rolesString;

		const filteredArray = array.filter(role => role !== ids.administratorID && role.name !== '@everyone');

		for (let i = 0; i < filteredArray.length; i++) {
			if (i % 3 === 0) rolesString += '\n';

			rolesString += `<@&${filteredArray[i]}> `;
		}

		return rolesString;
	}

	function errorText(helpTxt, cmd) {
		return '\n\n' + helpTxt + '\n' + formatList({
			'Help Command': `${pCmd(cmds.help, guild)} ${cmd}`,
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