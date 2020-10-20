const Discord = require('discord.js');

const { ids: { serverID, devID }, emojis: { successEmoji }, colours } = require('../config');
const { cmds: { restart } } = require('../cmds');
const { dtg, formatAge, debugError } = require('../modules');

module.exports = restart;
module.exports.execute = msg => {
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
		.setFooter(`${dtg()} | Pronto v${version}`);

	dev.send(restartEmbed)
		.then(() => process.exit())
		.catch(error => debugError(error, `Error sending DM to ${dev}.`));
};