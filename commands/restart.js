const Discord = require('discord.js');
const dateFormat = require('dateformat');

const modules = require('../modules');
const { cmdList: { restartCmd, helpCmd } } = modules;
const { cmdTxt: { restartDesc } } = modules;
const { debugError, formatAge } = modules;
const { constObj: {
	version,
	yellow,
	devID,
	debugID,
	dateOutput,
	successEmoji,
} } = modules;

module.exports = {
	name: restartCmd,
	description: restartDesc,
	execute(msg, args) {
		'use strict';

		const { bot } = require('../pronto.js');

		if (msg.author.id !== devID) {
			bot.commands.get(helpCmd).execute(msg, args);
			return;
		}

		else {
			const debugChannel = bot.channels.cache.get(debugID);
			const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

			msg.react(successEmojiObj).catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

			const restartEmbed = new Discord.MessageEmbed()
				.setAuthor(bot.user.tag, bot.user.avatarURL())
				.setDescription('**Restarting...**')
				.addField('Uptime', formatAge(bot.uptime))
				.setColor(yellow)
				.setFooter(`${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);
			debugChannel.send(restartEmbed).then(() => process.exit());
		}
	},
};