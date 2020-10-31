'use strict';

const { difference, merge } = require('../modules');

module.exports = async (guild, cmd) => {
	const Guild = require('../models/guild');
	const { cmds: cmds } = await require('../cmds')(guild);

	const database = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	database.cmds = await process(cmds, database);
	database.markModified('cmds');

	return await database.save().catch(error => console.error(error));
};

async function process(cmds, database) {
	const cmdsArray = Object.keys(cmds);
	const databaseArray = Object.keys(database.cmds);

	const diff = difference(cmdsArray, databaseArray);

	if (diff.length) {
		for (let i = 0; i < diff.length; i++) {
			if (cmdsArray.includes(diff[i])) database.cmds[diff[i]] = cmds[diff[i]];
			else if (databaseArray.includes(diff[i])) delete database.cmds[diff[i]];
		}
	}

	const procCmds = {};
	const uniqueKeys = ['roles', 'noRoles', 'devOnly', 'allowDM'];

	for (const [key, value] of Object.entries(cmds)) {
		for (let i = 0; i < uniqueKeys.length; i++) {
			delete value[uniqueKeys[i]];
		}
		procCmds[key] = value;
	}

	return merge(database.cmds, procCmds);
}