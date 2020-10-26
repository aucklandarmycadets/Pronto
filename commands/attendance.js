'use strict';

const Discord = require('discord.js');

const { ids: { attendanceID, formations }, emojis, colours } = require('../config');
const { cmds: { attendance } } = require('../cmds');
const { cmdError, debugError, delMsg, dtg, embedScaffold, errorReact, sendDM, sendMsg, successReact } = require('../modules');

module.exports = attendance;
module.exports.execute = async (msg, args) => {
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

		sendDM(msg.author, attendanceEmbed)
			.then(async dm => {
				await successReact(dm);
				await errorReact(dm);

				const filter = reaction => reaction.emoji.name === emojis.success || reaction.emoji.name === emojis.error;

				const collector = dm.createReactionCollector(filter, { dispose: true });

				collector.on('collect', (reaction, user) => {
					if (!user.bot) {
						const confirmEmbed = new Discord.MessageEmbed()
							.setAuthor(bot.user.tag, bot.user.avatarURL())
							.setColor(colours.error)
							.setDescription('**Cancelled.**')
							.setFooter(dtg());

						if (reaction.emoji.name === emojis.success) {
							confirmEmbed.setColor(colours.success);
							confirmEmbed.setDescription('**Confirmed.**');

							attendanceEmbed.setAuthor(`${formationName} (${msg.member.displayName})`, msg.guild.iconURL());

							if (chnlMsg) {
								attendanceEmbed.setFooter(`Last updated at ${dtg()}`);

								const formationDisplay = (msg.guild.roles.cache.find(role => role.name === formationName))
									? (msg.guild.roles.cache.find(role => role.name === formationName))
									: `**${formationName}**`;

								embedScaffold(msg.channel, `${msg.author} Successfully updated attendance for ${formationDisplay}.`, colours.success, 'msg');

								chnlMsg.edit(attendanceEmbed);
								attMsg.edit(attendanceEmbed);
							}

							else {
								const attendanceChannel = bot.channels.cache.get(attendanceID);

								attendanceEmbed.setFooter(dtg());

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
						sendDM(msg.author, timeEmbed, true);
					}
				});
			});
	}
};
