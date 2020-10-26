'use strict';

const Discord = require('discord.js');

const { ids: { adjPlus }, emojis: { successEmoji }, colours } = require('../config');
const { cmds: { purge } } = require('../cmds');
const { pCmd, dtg, sendMsg, debugError, purgeChannel } = require('../modules');
const pairs = require('../channelPairs');

module.exports = (oldState, newState) => {
	const { bot } = require('../pronto');

	const newMember = newState.member;

	const oldID = (oldState.channel)
		? oldState.channelID
		: null;

	const newID = (newState.channel)
		? newState.channelID
		: null;

	for (let i = 0; i < pairs.length; i++) {
		const textChannel = newState.guild.channels.cache.get(pairs[i].text);
		if (!textChannel) {
			console.error('Invalid text channel ID in JSON.');
			continue;
		}

		const vcID = pairs[i].voice;

		if (oldID !== vcID && newID === vcID) {
			textChannel.updateOverwrite(newState.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true })
				.then(() => {
					const joinEmbed = new Discord.MessageEmbed()
						.setColor(colours.success)
						.setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
						.setDescription(`${newMember} has joined the channel.`)
						.setFooter(`${dtg()}`);
					sendMsg(textChannel, joinEmbed);
				})
				.catch(error => {
					debugError(error, `Error giving ${newMember} permissions to ${textChannel}.`);
				});
		}

		else if (oldID === vcID && newID !== vcID) {
			textChannel.permissionOverwrites.get(newState.id).delete()
				.then(() => {
					const leaveEmbed = new Discord.MessageEmbed()
						.setColor(colours.error)
						.setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
						.setDescription(`${newMember} has left the channel.`)
						.setFooter(`${dtg()}`);
					sendMsg(textChannel, leaveEmbed);

					if (oldState.channel.members.size === 0) {
						const successEmojiObj = newState.guild.emojis.cache.find(emoji => emoji.name === successEmoji);

						const purgeEmbed = new Discord.MessageEmbed()
							.setTitle('Purge Text Channel')
							.setColor(colours.success)
							.setDescription(`Click on the ${successEmojiObj} reaction to purge this channel.`);
						sendMsg(textChannel, purgeEmbed)
							.then(msg => {
								msg.react(successEmojiObj)
									.catch(error => debugError(error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

								const filter = (reaction) => reaction.emoji.name === successEmoji;

								const collector = msg.createReactionCollector(filter, { dispose: true });

								collector.on('collect', (reaction, user) => {
									if (!user.bot) {
										if (msg.guild.members.cache.get(user.id).roles.cache.some(roles => adjPlus.includes(roles.id))) {
											msg.channel.messages.fetch({ limit: 100 })
												.then(messages => purgeChannel(messages, msg.channel, collector))
												.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));
										}

										else {
											const errorEmbed = new Discord.MessageEmbed()
												.setColor(colours.error)
												.setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
												.setDescription(`${user} Insufficient permissions. ${purge.error}`);
											sendMsg(textChannel, errorEmbed);
										}
									}
								});

								collector.on('remove', (reaction, user) => {
									if (msg.guild.members.cache.get(user.id).roles.cache.some(roles => adjPlus.includes(roles.id))) {
										msg.channel.messages.fetch({ limit: 100 })
											.then(messages => purgeChannel(messages, msg.channel, collector))
											.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));
									}
								});

								collector.on('end', (collected, reason) => {
									if (reason === 'time') {
										msg.reactions.removeAll()
											.catch(error => debugError(error, `Error removing reactions from [message](${msg.url}) in ${textChannel}.`));

										const timeEmbed = new Discord.MessageEmbed()
											.setColor(colours.error)
											.setAuthor(bot.user.tag, bot.user.avatarURL())
											.setDescription(`Timed out. Type \`${pCmd(purge)} 100\` to clear this channel manually.`);
										sendMsg(textChannel, timeEmbed);
									}
								});
							});
					}
				})
				.catch(error => {
					debugError(error, `Error removing ${newMember}'s permissions to ${textChannel}.`);
				});
		}
	}
};