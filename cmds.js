const config = require('./config');
const { ids: { devID, tacticalID, classroomID, tacPlus, sgtPlus, cqmsPlus, adjPlus } } = config;
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
	let startFormat, endFormat;
	const objProperties = [];
	const objValues = [];

	if (forList) [startFormat, endFormat] = ['`', '` - '];
	else [startFormat, endFormat] = ['**', ':** '];

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

const dmCmds = [
	cmds.ping.cmd,
	cmds.uptime.cmd,
	cmds.restart.cmd,
	cmds.help.cmd,
];

const cmdsList = {
	all: commandText(['help']),

	get cdt() {
		delete this.cdt;
		return this.cdt = cmdsList.all + '\n' + commandText([cmds.leave]);
	},
	get tac() {
		delete this.tac;
		return this.tac = cmdsList.cdt + '\n' + commandText([cmds.leaveFor, cmds.attendance]);
	},
	get sgt() {
		delete this.sgt;
		return this.sgt = cmdsList.tac + '\n' + commandText([cmds.connected]);
	},
	get cqms() {
		delete this.cqms;
		return this.cqms = cmdsList.sgt + '\n' + commandText([cmds.archive]);
	},
	get adj() {
		delete this.adj;
		return this.adj = cmdsList.cqms + '\n' + commandText([cmds.purge]);
	},
	get dev() {
		delete this.dev;
		return this.dev = cmdsList.adj + '\n' + commandText([cmds.ping, cmds.uptime, cmds.restart]);
	},
};

module.exports = {
	cmds: cmds,
	dmCmds: dmCmds,
	cmdsList: cmdsList,
};