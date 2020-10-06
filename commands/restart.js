const Discord = require('discord.js');
const dateFormat = require('dateformat');

const modules = require('../modules');
const { cmdList: { restartCmd, helpCmd } } = modules;
const { cmdTxt: { restartDesc } } = modules;
const { debugError, formatAge, dmCmdError } = modules;
const { constObj: {
	version,
	yellow,
	devID,
	serverID,
	dateOutput,
	successEmoji,
} } = modules;

module.exports = {
	name: restartCmd,
	description: restartDesc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');
		const authorID = msg.author.id;

		if (!msg.guild && authorID !== devID) {
			dmCmdError(msg);
			return;
		}

		if (authorID !== devID) {
			bot.commands.get(helpCmd).execute(msg, args);
			return;
		}

		else {
			const devDirectChannel = bot.users.cache.get(devID);
			const server = bot.guilds.cache.get(serverID);
			const successEmojiObj = server.emojis.cache.find(emoji => emoji.name === successEmoji);

			msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

			const restartEmbed = new Discord.MessageEmbed()
				.setAuthor(bot.user.tag, bot.user.avatarURL())
				.setDescription('**Restarting...**')
				.addField('Uptime', formatAge(bot.uptime))
				.setColor(yellow)
				.setFooter(`${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);
			devDirectChannel.send(restartEmbed).then(() => process.exit());
		}
	},
};