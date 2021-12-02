'use strict';

const Discord = require('discord.js');
const { Attendance } = require('../models');

const { debugError, deleteMsg, dateTimeGroup, embedScaffold, promptEmbed, sendDirect } = require('../modules');

const pendingInput = new Set();

module.exports = async (reaction, user) => {
	const { bot } = require('../pronto');
	const { confirmWithReaction } = require('./');

	const { ids: { attendanceID }, colours } = await require('../handlers/database')(reaction.message.guild);

	/**
	 * @type {Attendance}
	 */
	const db = await Attendance.findOne({ channelID: reaction.message.id });

	if (!db) return;

	const formation = reaction.message.guild.roles.cache.find(role => role.name === db.formation);

	if (!formation.members.get(user.id) && !db.authors.includes(user.id)) return reaction.users.remove(user.id);

	const attendanceChannel = bot.channels.cache.get(attendanceID);
	const attendanceMessage = await attendanceChannel.messages.fetch(db.attendanceID)
		.catch(error => debugError(error, `Error fetching messages in ${attendanceChannel}.`));

	if (reaction.emoji.name === '🗑️') {
		Attendance.findOneAndDelete({ channelID: reaction.message.id });
		deleteMsg(reaction.message);
		deleteMsg(attendanceMessage);
	}

	else if (reaction.emoji.name === '📝') {
		const createRegister = async input => {
			const content = input.split('\n');
			const title = content.shift();
			const register = content.join('\n');

			const member = await reaction.message.guild.members.fetch(user.id);

			const attendanceEmbed = new Discord.MessageEmbed(reaction.message.embeds[0])
				.setTitle(`${title} (Updated)`)
				.setAuthor(db.formation, reaction.message.guild.iconURL({ dynamic: true }))
				.setDescription(register)
				.setFooter('Use the reactions below to confirm or cancel.');

			sendDirect(user, { embeds: [attendanceEmbed] }, reaction.message.channel)
				.then(dm => {
					const sendAttendance = async () => {
						attendanceEmbed.setAuthor(`${db.formation} (${member.displayName})`, reaction.message.guild.iconURL({ dynamic: true }));
						attendanceEmbed.setFooter(`Last updated at ${await dateTimeGroup()}`);

						attendanceMessage.edit(attendanceEmbed);
						reaction.message.edit(attendanceEmbed);

						embedScaffold(reaction.message.guild, reaction.message.channel, `${user} Successfully updated attendance for **[${title}](${reaction.message.url})**.`, colours.success, 'MESSAGE');

						db.name = title;
						if (!db.authors.includes(user.id)) db.authors.push(user.id);

						db.save();
					};

					confirmWithReaction(reaction.message, dm, sendAttendance);
				});
		};

		userInput(user, reaction.message, colours, createRegister);
		reaction.users.remove(user.id);
	}
};

async function userInput(user, msg, colours, callback) {
	if (pendingInput.has(user.id)) return sendDirect(user, { embeds: [promptEmbed('You\'re already editing another register!', colours.error)] }, msg);

	const editingEmbed = new Discord.MessageEmbed()
		.setTitle(`Editing '${msg.embeds[0].title}'...`)
		.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
		.setColor(colours.success)
		.setDescription('Type `cancel` to exit.')
		.addField('Current Attendance', msg.embeds[0].description)
		.setFooter(await dateTimeGroup());

	const dm = await sendDirect(user, { embeds: [editingEmbed.addField('Message Link', `[${msg.embeds[0].title}](${msg.url})`)] }, msg.channel);

	if (!dm) return;

	pendingInput.add(user.id);

	const input = await msgPrompt(promptEmbed('Please reply with your updated register.', colours.primary), user, msg.channel, colours);

	if (input.toLowerCase() === 'cancel') {
		const { bot } = require('../pronto');

		const cancelEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setColor(colours.error)
			.setDescription('**Cancelled.**')
			.setFooter(await dateTimeGroup());

		pendingInput.delete(user.id);

		return sendDirect(user, { embeds: [cancelEmbed] }, msg.channel);
	}

	else callback(input);
}

async function msgPrompt(prompt, user, channel, colours) {
	const reply = await Promise.all([
		sendDirect(user, { embeds: [prompt] }, channel),
		user.dmChannel.awaitMessages(msg => msg.author.id === user.id, { max: 1 }),
	])
		.then(resolved => resolved[1].first());

	try {
		if (!reply.content) {
			sendDirect(user, { embeds: [promptEmbed('You must enter something!', colours.error)] }, null, true);
			throw await msgPrompt(prompt, user, channel, colours);
		}

		throw reply.content;
	}

	catch (thrown) { return thrown; }
}