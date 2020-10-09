const Discord = require('discord.js');
const dateFormat = require('dateformat');

const config = require('../config');
const { config: { dateOutput }, ids: { serverID, devID } } = config;
const { emojis: { successEmoji }, colours } = config;
const { cmds: { restart } } = require('../cmds');
const { formatAge, debugError } = require('../modules');

module.exports = {
	cmd: restart.cmd,
	aliases: restart.aliases,
	description: restart.desc,
	allowDM: restart.allowDM,
	roles: restart.roles,
	noRoles: restart.noRoles,
	devOnly: restart.devOnly,
	help: restart.help,
	execute(msg) {
		'use strict';

		const { bot, version } = require('../pronto.js');

		const dev = bot.users.cache.get(devID);
		const server = bot.guilds.cache.get(serverID);
		const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);

		msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

		const restartEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL())
			.setDescription('**Restarting...**')
			.addField('Uptime', formatAge(bot.uptime))
			.setColor(colours.warn)
			.setFooter(`${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);

		dev.send(restartEmbed)
			.then(() => process.exit())
			.catch(error => debugError(error, `Error sending DM to ${dev}.`));
	},
};