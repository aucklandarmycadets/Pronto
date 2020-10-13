'use strict';

const config = require('./config');
const { ids: { devID, tacticalID, classroomID, nonCadet, tacPlus, sgtPlus, cqmsPlus, adjPlus } } = config;
const { config: { prefix: pref } } = config;
const { pCmd, rolesOutput } = require('./modules');

const commandText = (tier, type) => {
	const commands = [];

	for (const obj of Object.values(cmds)) {
		if (!type) commands.push('help');

		else if ((type === 'role' && obj.roles === tier)
			|| (type === 'noRole' && obj.noRoles === tier)
			|| (type === 'dev' && obj.devOnly)) {
			commands.push(obj);
		}
	}

	const object = {};

	for (let i = 0; i < commands.length; i++) {
		if (commands[i] === 'help') {
			object[`${pCmd(cmds.help)}`] = cmds.help.desc.unqualified;
			object[`${pCmd(cmds.help)} [command]`] = cmds.help.desc.qualified;
			continue;
		}
		object[`${pCmd(commands[i])}`] = commands[i].desc;
	}
	return helpText(object, true);
};

const helpText = (object, forList) => {
	let helpString = '';
	const objProperties = [];
	const objValues = [];

	const [startFormat, endFormat] = (forList)
		? ['`', '` - ']
		: ['**', ':** '];

	for (const [property, value] of Object.entries(object)) {
		objProperties.push(property);
		objValues.push(value);
	}

	for (let i = 0; i < objProperties.length; i++) {
		helpString += `${startFormat}${objProperties[i]}${endFormat}${objValues[i]}`;

		if (i < (objProperties.length - 1)) helpString += '\n';
	}
	return helpString;
};

const errorText = (helpTxt, cmd) => {
	return '\n\n' + helpTxt + '\n' + helpText({
		'Help Command': `${pCmd(cmds.help)} ${cmd}`,
	});
};

const pAls = cmd => {
	const als = [...cmd.aliases];
	for (let i = 0; i < als.length; i++) als[i] = `${pref}${als[i]}`;
	return als.join(', ');
};

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
				'Usage': pCmd(this),
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
				'Usage': pCmd(this),
			});
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
			return this.help = helpText({
				'Aliases': pAls(this),
				'Description': this.desc,
				'Usage': pCmd(this),
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
		roles: [],
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Aliases': pAls(this),
				'Description': this.desc.general,
				'Usage': `${pCmd(this)} [command]`,
				'Examples': `\n${pCmd(this)}\n${pCmd(this)} ${cmds.leave.cmd}`,
			});
		},
	},
	leave: {
		cmd: 'leave',
		aliases: ['lv'],
		desc: 'Submit a leave request.',
		allowDM: false,
		roles: [],
		noRoles: nonCadet,
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Aliases': pAls(this),
				'Description': this.desc,
				'Usage': `${pCmd(this)} <dates> <activity> <reason> [additional remarks]`,
				'Example': `${pCmd(this)} 01 Jan for Parade Night due to an appointment`,
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	leaveFor: {
		cmd: 'leavefor',
		aliases: ['lv4'],
		desc: 'Submit a leave request for another cadet.',
		allowDM: false,
		roles: tacPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Aliases': pAls(this),
				'Description': this.desc,
				'Usage': `${pCmd(this)} <user> <dates> <activity> <reason> [additional remarks]`,
				'Example': `${pCmd(this)} <@${devID}> 01 Jan for Parade Night due to an appointment`,
				'Allowed Roles': rolesOutput(this.roles),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	attendance: {
		cmd: 'attendance',
		aliases: ['att', 'attdnce'],
		desc: 'Submit an attendance register.',
		allowDM: false,
		roles: tacPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Aliases': pAls(this),
				'Description': this.desc,
				'Usage': `\n${pCmd(this)} <message>\n${pCmd(this)} update <message>`,
				'Allowed Roles': rolesOutput(this.roles),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	connected: {
		cmd: 'connected',
		aliases: ['cnnct', 'cnnctd'],
		desc: 'List the members connected to a voice channel.',
		allowDM: false,
		roles: sgtPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Aliases': pAls(this),
				'Description': this.desc,
				'Usage': `${pCmd(this)} <voice channel>`,
				'Example': `${pCmd(this)} <#${classroomID}>`,
				'Allowed Roles': rolesOutput(this.roles),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	archive: {
		cmd: 'archive',
		aliases: ['archv'],
		desc: 'Archive a text channel.',
		allowDM: false,
		roles: cqmsPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Aliases': pAls(this),
				'Description': this.desc,
				'Usage': `${pCmd(this)} <text channel>`,
				'Example': `${pCmd(this)} <#${tacticalID}>`,
				'Allowed Roles': rolesOutput(this.roles),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	purge: {
		cmd: 'purge',
		aliases: ['del', 'delete'],
		desc: 'Delete a number of messages from a channel.',
		allowDM: false,
		roles: adjPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Aliases': pAls(this),
				'Description': this.desc,
				'Usage': `${pCmd(this)} <count> [user]`,
				'Examples': `\n${pCmd(this)} 10\n${pCmd(this)} 5 <@${devID}>`,
				'Allowed Roles': rolesOutput(this.roles),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
};

const cmdsList = {
	all: {
		type: null,
		ids: null,
		cmds: commandText(this.ids, this.type),
	},
	cdt: {
		type: 'noRole',
		ids: nonCadet,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.all.cmds + '\n' + commandText(this.ids, this.type);
		},
	},
	tac: {
		type: 'role',
		ids: tacPlus,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.cdt.cmds + '\n' + commandText(this.ids, this.type);
		},
	},
	sgt: {
		type: 'role',
		ids: sgtPlus,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.tac.cmds + '\n' + commandText(this.ids, this.type);
		},
	},
	cqms: {
		type: 'role',
		ids: cqmsPlus,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.sgt.cmds + '\n' + commandText(this.ids, this.type);
		},
	},
	adj: {
		type: 'role',
		ids: adjPlus,
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

module.exports = {
	cmds: cmds,
	cmdsList: cmdsList,
};