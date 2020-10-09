'use strict';

const config = require('./config');
const { ids: { devID, tacticalID, classroomID, nonCadet, tacPlus, sgtPlus, cqmsPlus, adjPlus } } = config;
const { config: { prefix: pref } } = config;
const { pCmd, rolesOutput } = require('./modules');

const commandText = commands => {
	const object = {};

	for (let i = 0; i < commands.length; i++) {
		if (commands[i] === 'help') {
			object[`${pref}${cmds.help.cmd}`] = cmds.help.desc.unqualified;
			object[`${pref}${cmds.help.cmd} [command]`] = cmds.help.desc.qualified;
			continue;
		}
		object[`${pref}${commands[i].cmd}`] = commands[i].desc;
	}
	return helpText(object, true);
};

const helpText = (object, forList) => {
	let helpString = '';
	const objProperties = [];
	const objValues = [];

	const [startFormat, endFormat] = (forList) ? ['`', '` - '] : ['**', ':** '];

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

const cmds = {
	ping: {
		cmd: 'ping',
		desc: 'Test the latency of the bot.',
		allowDM: true,
		roles: [],
		noRoles: [],
		devOnly: true,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': pCmd(this),
			});
		},
	},
	uptime: {
		cmd: 'uptime',
		desc: 'Time since last restart.',
		allowDM: true,
		roles: [],
		noRoles: [],
		devOnly: true,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': pCmd(this),
			});
		},
	},
	restart: {
		cmd: 'restart',
		desc: 'Restart the bot.',
		allowDM: true,
		roles: [],
		noRoles: [],
		devOnly: true,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': pCmd(this),
			});
		},
	},
	help: {
		cmd: 'help',
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
				'Description': this.desc.general,
				'Usage': `${pCmd(this)} [command]`,
				'Examples': `\n${pCmd(this)}\n${pCmd(this)} ${cmds.leave.cmd}`,
			});
		},
	},
	leave: {
		cmd: 'leave',
		desc: 'Submit a leave request.',
		allowDM: false,
		roles: [],
		noRoles: nonCadet,
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': `${pCmd(this)} <dates> <activity> <reason> [additional remarks]`,
				'Example': `${pCmd(this)} 01 Jan for Parade Night due to an appointment`,
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	leaveFor: {
		cmd: 'leavefor',
		desc: 'Submit a leave request for another cadet.',
		allowDM: false,
		roles: tacPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': `${pCmd(this)} <user> <dates> <activity> <reason> [additional remarks]`,
				'Example': `${pCmd(this)} <@${devID}> 01 Jan for Parade Night due to an appointment`,
				'Allowed Roles': rolesOutput(tacPlus),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	attendance: {
		cmd: 'attendance',
		desc: 'Submit an attendance register.',
		allowDM: false,
		roles: tacPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': `${pCmd(this)} <message>`,
				'Allowed Roles': rolesOutput(tacPlus),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	connected: {
		cmd: 'connected',
		desc: 'List of members connected to a voice channel.',
		allowDM: false,
		roles: sgtPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': `${pCmd(this)} <voice channel>`,
				'Example': `${pCmd(this)} <#${classroomID}>`,
				'Allowed Roles': rolesOutput(sgtPlus),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	archive: {
		cmd: 'archive',
		desc: 'Archive a text channel.',
		allowDM: false,
		roles: cqmsPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': `${pCmd(this)} <text channel>`,
				'Example': `${pCmd(this)} <#${tacticalID}>`,
				'Allowed Roles': rolesOutput(cqmsPlus),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
	purge: {
		cmd: 'purge',
		desc: 'Delete a number of messages from a channel.',
		allowDM: false,
		roles: adjPlus,
		noRoles: [],
		devOnly: false,
		get help() {
			delete this.help;
			return this.help = helpText({
				'Description': this.desc,
				'Usage': `${pCmd(this)} <count> [user]`,
				'Examples': `\n${pCmd(this)} 10\n${pCmd(this)} 5 <@${devID}>`,
				'Allowed Roles': rolesOutput(adjPlus),
			});
		},
		get error() { return errorText(this.help, this.cmd); },
	},
};

const cmdsList = {
	all: {
		type: null,
		ids: null,
		cmds: commandText(['help']),
	},
	nonCadet: {
		type: 'noRole',
		ids: nonCadet,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.all.cmds + '\n' + commandText([cmds.leave]);
		},
	},
	tacPlus: {
		type: 'role',
		ids: tacPlus,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.nonCadet.cmds + '\n' + commandText([cmds.leaveFor, cmds.attendance]);
		},
	},
	sgtPlus: {
		type: 'role',
		ids: sgtPlus,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.tacPlus.cmds + '\n' + commandText([cmds.connected]);
		},
	},
	cqmsPlus: {
		type: 'role',
		ids: cqmsPlus,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.sgtPlus.cmds + '\n' + commandText([cmds.archive]);
		},
	},
	adjPlus: {
		type: 'role',
		ids: adjPlus,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.cqmsPlus.cmds + '\n' + commandText([cmds.purge]);
		},
	},
	dev: {
		type: 'user',
		ids: devID,
		get cmds() {
			delete this.cmds;
			return this.cmds = cmdsList.adjPlus.cmds + '\n' + commandText([cmds.ping, cmds.uptime, cmds.restart]);
		},
	},
};

module.exports = {
	cmds: cmds,
	cmdsList: cmdsList,
};