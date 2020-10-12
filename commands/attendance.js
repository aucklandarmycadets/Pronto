const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput }, ids: { attendanceID, formations }, emojis: { successEmoji, errorEmoji }, colours } = require('../config');
const { cmds: { attendance } } = require('../cmds');
const { cmdError, sendMsg, dmError, debugError } = require('../modules');

module.exports = attendance;
module.exports.execute = (msg, args) => {
	'use strict';

	const { bot } = require('../pronto.js');
	const memberRoles = msg.member.roles.cache;

	if (args.length === 0) return cmdError(msg, 'You must enter a message.', attendance.error);

	msg.delete().catch(error => debugError(error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

	let formationColour = colours.default;
	let formationName = msg.guild.name;

	for (const role of Object.values(memberRoles.array())) {
		if (formations.includes(role.id)) {
			formationColour = role.color;
			formationName = role.name;
		}
	}

	const successEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === successEmoji);
	const errorEmojiObj = msg.guild.emojis.cache.find(emoji => emoji.name === errorEmoji);
	const register = args.join(' ');

	const attendanceEmbed = new Discord.MessageEmbed()
		.setColor(formationColour)
		.setAuthor(formationName, msg.guild.iconURL())
		.setDescription(register)
		.setFooter('Use the reactions below to confirm or cancel.');

	msg.author.send(attendanceEmbed)
		.then(dm => {
			dm.react(successEmojiObj)
				.then(() => dm.react(errorEmojiObj))
				.catch(error => debugError(error, 'Error reacting to message in DMs.'));

			const filter = (reaction) => reaction.emoji.name === successEmoji || reaction.emoji.name === errorEmoji;

			const collector = dm.createReactionCollector(filter, { time: 90000, dispose: true });

			collector.on('collect', (reaction, user) => {
				if (!user.bot) {
					const updateEmbed = new Discord.MessageEmbed()
						.setAuthor(bot.user.tag, bot.user.avatarURL())
						.setColor(colours.error)
						.setDescription('**Cancelled.**')
						.setFooter(dateFormat(dateOutput));

					if (reaction.emoji.name === successEmoji) {
						const attendanceChannel = bot.channels.cache.get(attendanceID);

						updateEmbed.setColor(colours.success);
						updateEmbed.setDescription('**Confirmed.**');

						attendanceEmbed.setFooter(dateFormat(dateOutput));

						sendMsg(attendanceChannel, attendanceEmbed);
						sendMsg(msg.channel, attendanceEmbed);
					}

					dm.edit(updateEmbed);
					collector.stop();
				}
			});

			collector.on('end', async (collected, reason) => {
				const userReactions = dm.reactions.cache.filter(reaction => reaction.users.cache.has(bot.user.id));
				try {
					for (const reaction of userReactions.values()) {
						await reaction.users.remove(bot.user.id);
					}
				}

				catch (error) {
					debugError(error, 'Error removing reactions from message in DMs.');
				}

				if (reason === 'time') {
					dm.delete().catch(error => debugError(error, 'Error deleting message in DMs.'));

					const timeEmbed = new Discord.MessageEmbed()
						.setColor(colours.error)
						.setAuthor(bot.user.tag, bot.user.avatarURL())
						.setDescription('Timed out. Please action the command again.');
					sendMsg(msg.author, timeEmbed, true);
				}
			});
		})
		.catch(error => dmError(msg, error));
};