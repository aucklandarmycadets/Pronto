const { config: { prefix } } = require('../config');
const { cmds: { help } } = require('../cmds');
const { pCmd, cmdPermsCheck, debugError, dmCmdError } = require('../modules');

module.exports = {
	events: ['message'],
	process: [],
	execute(event, msg) {
		const { bot } = require('../pronto');

		if (msg.channel.type === 'news') {
			msg.react('✅').catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));
		}

		if (msg.author.bot || !msg.content.startsWith(prefix)) return;

		const args = msg.content.split(/ +/);
		const msgCmd = args.shift().toLowerCase().replace(prefix, '');
		const helpCmd = bot.commands.get(help.cmd);

		const cmd = bot.commands.get(msgCmd) || bot.commands.find(command => command.aliases && command.aliases.includes(msgCmd));

		if (!cmd) {
			const regExp = /[a-zA-Z]/g;
			if (!regExp.test(msgCmd)) return;
			else if (!msg.guild) return dmCmdError(msg);
			else return helpCmd.execute(msg, args);
		}

		const hasPerms = cmdPermsCheck(msg, cmd);

		if (hasPerms === 'err') return;

		if (msg.guild && !hasPerms) return helpCmd.execute(msg, args);
		else if (!msg.guild && !hasPerms) return dmCmdError(msg, 'noPerms');
		else if (!msg.guild && !cmd.allowDM) return dmCmdError(msg, 'noDM');

		try {
			cmd.execute(msg, args);
		}

		catch (error) {
			debugError(error, `Error executing ${pCmd(cmd)}`);
		}
	},
};