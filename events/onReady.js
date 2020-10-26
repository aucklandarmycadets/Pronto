const { ids: { serverID, devID }, colours } = require('../config');
const { cmds: { help } } = require('../cmds');
const { verifyBotPermissions, pCmd, embedScaffold } = require('../modules');

module.exports = {
	events: ['ready'],
	process: [],
	execute() {
		const { bot } = require('../pronto');
		const dev = bot.users.cache.get(devID);

		console.info(`Logged in as ${bot.user.tag}!`);
		bot.user.setActivity(`the radio net | ${pCmd(help)}`, { type: 'LISTENING' });

		if (!bot.guilds.cache.get(serverID)) return embedScaffold(dev, '**Error reaching the server, check the IDs!**', colours.error, 'dev');
		else embedScaffold(dev, '**Ready to go!**', colours.success, 'dev');

		verifyBotPermissions();
	},
};