'use strict';

const Discord = require('discord.js');
const { cmdError, debugError, delMsg, dtg, embedScaffold, errorReact, sendDM, sendMsg, successReact } = require('../modules');

module.exports = async guild => {
	const { ids: { attendanceID, formations }, cmds: { attendance }, emojis, colours } = await require('../handlers/database')(guild);

	attendance.execute = async (msg, args) => {
		const { bot } = require('../pronto');

		const memberRoles = msg.member.roles.cache;

		try {
			if (args.length === 0) throw '';

			if (args[0].toLowerCase() === 'update' && args.length === 1) throw '';
		}

		catch (error) {
			return cmdError(msg, 'You must enter a message.', attendance.error);
		}

		delMsg(msg);

		let formationColour = colours.default;
		let formationName = msg.guild.name;

		for (const role of Object.values(memberRoles.array())) {
			if (formations.includes(role.id)) {
				formationColour = role.color;
				formationName = role.name;
			}
		}

		if (args[0].toLowerCase() === 'update') {
			args.splice(0, 1);

			if (args.length === 0) return cmdError(msg, 'You must enter a message.', attendance.error);

			const filterBy = message => {
				try { return message.embeds[0].author.name.includes(formationName); }
				catch { null; }
			};

			const attendanceChannel = bot.channels.cache.get(attendanceID);
			let chnlMsg, attMsg;

			await msg.channel.messages.fetch()
				.then(messages => {
					chnlMsg = messages.filter(filterBy).first();
				})
				.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));

			await attendanceChannel.messages.fetch()
				.then(messages => {
					attMsg = messages.filter(filterBy).first();
				})
				.catch(error => debugError(error, `Error fetching messages in ${msg.channel}.`));

			createRegister(chnlMsg, attMsg);
		}

		else createRegister();

		function createRegister(chnlMsg, attMsg) {
			const register = args.join(' ');

			const attendanceEmbed = new Discord.MessageEmbed()
				.setColor(formationColour)
				.setAuthor(formationName, msg.guild.iconURL())
				.setDescription(register)
				.setFooter('Use the reactions below to confirm or cancel.');

			if (chnlMsg) attendanceEmbed.setAuthor(`${formationName} (Update)`, msg.guild.iconURL());

			sendDM(msg.author, attendanceEmbed, msg.channel)
				.then(async dm => {
					await successReact(dm);
					await errorReact(dm);

					const filter = reaction => reaction.emoji.name === emojis.success.name || reaction.emoji.name === emojis.error.name;

					const collector = dm.createReactionCollector(filter, { dispose: true });

					collector.on('collect', async (reaction, user) => {
						if (!user.bot) {
							const confirmEmbed = new Discord.MessageEmbed()
								.setAuthor(bot.user.tag, bot.user.avatarURL())
								.setColor(colours.error)
								.setDescription('**Cancelled.**')
								.setFooter(await dtg());

							if (reaction.emoji.name === emojis.success.name) {
								confirmEmbed.setColor(colours.success);
								confirmEmbed.setDescription('**Confirmed.**');

								attendanceEmbed.setAuthor(`${formationName} (${msg.member.displayName})`, msg.guild.iconURL());

								if (chnlMsg) {
									attendanceEmbed.setFooter(`Last updated at ${await dtg()}`);

									const findFormation = role => role.name === formationName;
									const formationDisplay = msg.guild.roles.cache.find(findFormation) || `**${formationName}**`;

									embedScaffold(msg.channel, `${msg.author} Successfully updated attendance for ${formationDisplay}.`, colours.success, 'msg');

									chnlMsg.edit(attendanceEmbed);
									attMsg.edit(attendanceEmbed);
								}

								else {
									const attendanceChannel = bot.channels.cache.get(attendanceID);

									attendanceEmbed.setFooter(await dtg());

									sendMsg(attendanceChannel, attendanceEmbed);
									sendMsg(msg.channel, attendanceEmbed);
								}
							}

							dm.edit(confirmEmbed);
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
							delMsg(dm);

							const timeEmbed = new Discord.MessageEmbed()
								.setColor(colours.error)
								.setAuthor(bot.user.tag, bot.user.avatarURL())
								.setDescription('Timed out. Please action the command again.');
							sendDM(msg.author, timeEmbed, msg.channel, true);
						}
					});
				});
		}
	};

	return attendance;
};