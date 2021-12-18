'use strict';

const Discord = require('discord.js');

const { dateTimeGroup, jsCodeBlock, prefixCommand } = require('../modules');
const { debugError, embedScaffold, findGuildConfiguration, permissionsCheck, purgeChannel, sendMsg, successReact } = require('../handlers');

/** */

/**
 *
 * @function handlers.channelPairing
 * @param {Discord.VoiceState} oldState The \<VoiceState> before the update
 * @param {Discord.VoiceState} newState The \<VoiceState> after the update
 */
module.exports = async (oldState, newState) => {
	const { bot } = require('../pronto');
	const { ids: { channelPairs }, commands: { purge }, emojis, colours } = await findGuildConfiguration(newState.guild);

	const newMember = newState.member;

	const oldId = (oldState.channel)
		? oldState.channelId
		: null;

	const newId = (newState.channel)
		? newState.channelId
		: null;

	for (let i = 0; i < channelPairs.length; i++) {
		const textChannel = newState.guild.channels.cache.get(channelPairs[i].text);
		if (!textChannel) {
			embedScaffold(newState.guild, null, 'Invalid text channel Id', colours.error, 'DEBUG', null, null, jsCodeBlock(`#${channelPairs[i].text}`));
			continue;
		}

		const vcId = channelPairs[i].voice;

		if (oldId !== vcId && newId === vcId) {
			textChannel.updateOverwrite(newState.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true })
				.then(async () => {
					const joinEmbed = new Discord.MessageEmbed()
						.setColor(colours.success)
						.setAuthor(newMember.displayName, newMember.user.displayAvatarURL({ dynamic: true }))
						.setDescription(`**${newMember.displayName}** has joined the channel.`)
						.setFooter(await dateTimeGroup(newState.guild));
					sendMsg(textChannel, { embeds: [joinEmbed] });
				})
				.catch(error => {
					debugError(newState.guild, error, `Error giving ${newMember} permissions to ${textChannel}.`);
				});
		}

		else if (oldId === vcId && newId !== vcId) {
			textChannel.permissionOverwrites.get(newState.id).delete()
				.then(async () => {
					const leaveEmbed = new Discord.MessageEmbed()
						.setColor(colours.error)
						.setAuthor(newMember.displayName, newMember.user.displayAvatarURL({ dynamic: true }))
						.setDescription(`**${newMember.displayName}** has left the channel.`)
						.setFooter(await dateTimeGroup(newState.guild));
					sendMsg(textChannel, { embeds: [leaveEmbed] });

					if (oldState.channel.members.size === 0) {
						const successEmoji = newState.guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

						const purgeEmbed = new Discord.MessageEmbed()
							.setTitle('Purge Text Channel')
							.setColor(colours.success)
							.setDescription(`Click on the ${successEmoji} reaction to purge this channel.`);
						sendMsg(textChannel, { embeds: [purgeEmbed] })
							.then(msg => {
								successReact(msg);

								const filter = reaction => reaction.emoji.name === emojis.success.name;
								const collector = msg.createReactionCollector(filter, { dispose: true });

								collector.on('collect', async (_, user) => {
									if (!user.bot) {
										if (permissionsCheck(await msg.guild.members.fetch(user.id).then(member => member.roles.cache), user.id, purge)) {
											msg.channel.messages.fetch({ limit: 100 })
												.then(messages => purgeChannel(messages, msg.channel, collector))
												.catch(error => debugError(newState.guild, error, `Error fetching messages in ${msg.channel}.`));
										}

										else {
											const errorEmbed = new Discord.MessageEmbed()
												.setColor(colours.error)
												.setAuthor(newMember.displayName, newMember.user.displayAvatarURL({ dynamic: true }))
												.setDescription(`${user} Insufficient permissions. ${purge.error}`);
											sendMsg(textChannel, { embeds: [errorEmbed] });
										}
									}
								});

								collector.on('remove', async (_, user) => {
									if (permissionsCheck(await msg.guild.members.fetch(user.id).then(member => member.roles.cache), user.id, purge)) {
										msg.channel.messages.fetch({ limit: 100 })
											.then(messages => purgeChannel(messages, msg.channel, collector))
											.catch(error => debugError(newState.guild, error, `Error fetching messages in ${msg.channel}.`));
									}
								});

								collector.on('end', async (_, reason) => {
									if (reason === 'time') {
										msg.reactions.removeAll()
											.catch(error => debugError(newState.guild, error, `Error removing reactions from [message](${msg.url}) in ${textChannel}.`));

										const timeEmbed = new Discord.MessageEmbed()
											.setColor(colours.error)
											.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
											.setDescription(`Timed out. Type \`${await prefixCommand(purge, newState.guild)} 100\` to clear this channel manually.`);
										sendMsg(textChannel, { embeds: [timeEmbed] });
									}
								});
							});
					}
				})
				.catch(error => {
					debugError(newState.guild, error, `Error removing ${newMember}'s permissions to ${textChannel}.`);
				});
		}
	}
};