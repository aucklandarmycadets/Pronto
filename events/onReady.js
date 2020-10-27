'use strict';

const { ids: { devID } } = require('../config');
const { embedScaffold, pCmd } = require('../modules');
const { botPermsHandler } = require('../handlers');

module.exports = {
	events: ['ready'],
	process: [],
	async execute() {
		const { bot } = require('../pronto');
		const { ids: { serverID }, colours } = await require('../handlers/database')();
		const { cmds: { help } } = await require('../cmds')();

		const dev = await bot.users.fetch(devID);

		console.info(`Logged in as ${bot.user.tag}!`);
		bot.user.setActivity(`the radio net | ${pCmd(help)}`, { type: 'LISTENING' });

		if (!bot.guilds.cache.get(serverID)) return embedScaffold(dev, '**Error reaching the server, check the IDs!**', colours.error, 'dev');
		else embedScaffold(dev, '**Ready to go!**', colours.success, 'dev');

		botPermsHandler();
	},
};