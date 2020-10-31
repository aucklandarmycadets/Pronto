'use strict';

const Discord = require('discord.js');
const { debugError, dtg, pCmd, purgeChannel, sendMsg, successReact } = require('../modules');
const pairs = require('../channelPairs');

module.exports = async (oldState, newState) => {
	const { bot } = require('../pronto');
	const { permissionsCheck } = require('./');
	const { cmds: { purge }, emojis, colours } = await require('./database')(newState.guild);

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
				.then(async () => {
					const joinEmbed = new Discord.MessageEmbed()
						.setColor(colours.success)
						.setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
						.setDescription(`${newMember} has joined the channel.`)
						.setFooter(await dtg());
					sendMsg(textChannel, joinEmbed);
				})
				.catch(error => {
					debugError(error, `Error giving ${newMember} permissions to ${textChannel}.`);
				});
		}

		else if (oldID === vcID && newID !== vcID) {
			textChannel.permissionOverwrites.get(newState.id).delete()
				.then(async () => {
					const leaveEmbed = new Discord.MessageEmbed()
						.setColor(colours.error)
						.setAuthor(newMember.displayName, newMember.user.displayAvatarURL())
						.setDescription(`${newMember} has left the channel.`)
						.setFooter(await dtg());
					sendMsg(textChannel, leaveEmbed);

					if (oldState.channel.members.size === 0) {
						const successEmoji = newState.guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

						const purgeEmbed = new Discord.MessageEmbed()
							.setTitle('Purge Text Channel')
							.setColor(colours.success)
							.setDescription(`Click on the ${successEmoji} reaction to purge this channel.`);
						sendMsg(textChannel, purgeEmbed)
							.then(msg => {
								successReact(msg);

								const filter = reaction => reaction.emoji.name === emojis.success.name;

								const collector = msg.createReactionCollector(filter, { dispose: true });

								collector.on('collect', (reaction, user) => {
									if (!user.bot) {
										if (permissionsCheck(msg.guild.members.cache.get(user.id).roles.cache, user.id, purge)) {
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
									if (permissionsCheck(msg.guild.members.cache.get(user.id).roles.cache, user.id, purge)) {
										msg.channel.messages.fetch({ limit: 100 })
											.then(messages => purgeChannel(messages, msg.channel, collector))
											.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));
									}
								});

								collector.on('end', async (collected, reason) => {
									if (reason === 'time') {
										msg.reactions.removeAll()
											.catch(error => debugError(error, `Error removing reactions from [message](${msg.url}) in ${textChannel}.`));

										const timeEmbed = new Discord.MessageEmbed()
											.setColor(colours.error)
											.setAuthor(bot.user.tag, bot.user.avatarURL())
											.setDescription(`Timed out. Type \`${await pCmd(purge, newState.guild)} 100\` to clear this channel manually.`);
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