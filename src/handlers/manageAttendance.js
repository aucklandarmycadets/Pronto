'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { Attendance } = require('../models');
const { dateTimeGroup } = require('../modules');
const { confirmWithReaction, createEmbed, debugError, deleteMsg, embedScaffold, findGuildConfiguration, sendDirect } = require('../handlers');

const pendingInput = new Set();

/** */

/**
 *
 * @function handlers.manageAttendance
 * @param {Discord.MessageReaction} reaction The reaction object
 * @param {Discord.User} user The \<User> that applied the guild or reaction emoji
 */
module.exports = async (reaction, user) => {
	const { bot } = require('../pronto');
	const { ids: { attendanceId }, colours } = await findGuildConfiguration(reaction.message.guild);

	/**
	 * @type {?Typings.Attendance}
	 */
	const document = await Attendance.findOne({ channelId: reaction.message.id }).exec()
		.catch(error => console.error(error));

	if (!document) return;

	const formation = reaction.message.guild.roles.cache.find(role => role.name === document.formation);

	if (!formation.members.get(user.id) && !document.authors.includes(user.id)) return reaction.users.remove(user.id);

	const attendanceChannel = bot.channels.cache.get(attendanceId);
	const attendanceMessage = await attendanceChannel.messages.fetch(document.attendanceId)
		.catch(error => debugError(reaction.message.guild, error, `Error fetching messages in ${attendanceChannel}.`));

	if (reaction.emoji.name === '🗑️') {
		Attendance.findOneAndDelete({ channelId: reaction.message.id });
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
				.setAuthor(document.formation, reaction.message.guild.iconURL({ dynamic: true }))
				.setDescription(register)
				.setFooter('Use the reactions below to confirm or cancel.');

			sendDirect(user, { embeds: [attendanceEmbed] }, reaction.message.channel)
				.then(dm => {
					const sendAttendance = async () => {
						attendanceEmbed.setAuthor(`${document.formation} (${member.displayName})`, reaction.message.guild.iconURL({ dynamic: true }));
						attendanceEmbed.setFooter(`Last updated at ${await dateTimeGroup(reaction.message.guild)}`);

						attendanceMessage.edit(attendanceEmbed);
						reaction.message.edit(attendanceEmbed);

						embedScaffold(reaction.message.guild, reaction.message.channel, `${user} Successfully updated attendance for **[${title}](${reaction.message.url})**.`, colours.success, 'MESSAGE');

						document.name = title;
						if (!document.authors.includes(user.id)) document.authors.push(user.id);

						document.save();
					};

					confirmWithReaction(reaction.message, dm, sendAttendance);
				});
		};

		userInput(user, reaction.message, colours, createRegister);
		reaction.users.remove(user.id);
	}
};

async function userInput(user, msg, colours, callback) {
	if (pendingInput.has(user.id)) return sendDirect(user, { embeds: [createEmbed('You\'re already editing another register!', colours.error)] }, msg);

	const editingEmbed = new Discord.MessageEmbed()
		.setTitle(`Editing '${msg.embeds[0].title}'...`)
		.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
		.setColor(colours.success)
		.setDescription('Type `cancel` to exit.')
		.addField('Current Attendance', msg.embeds[0].description)
		.setFooter(await dateTimeGroup(msg.guild));

	const dm = await sendDirect(user, { embeds: [editingEmbed.addField('Message Link', `[${msg.embeds[0].title}](${msg.url})`)] }, msg.channel);

	if (!dm) return;

	pendingInput.add(user.id);

	const input = await msgPrompt(createEmbed('Please reply with your updated register.', colours.primary), user, msg.channel, colours);

	if (input.toLowerCase() === 'cancel') {
		const { bot } = require('../pronto');

		const cancelEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setColor(colours.error)
			.setDescription('**Cancelled.**')
			.setFooter(await dateTimeGroup(msg.guild));

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
			sendDirect(user, { embeds: [createEmbed('You must enter something!', colours.error)] }, null, true);
			throw await msgPrompt(prompt, user, channel, colours);
		}

		throw reply.content;
	}

	catch (thrown) { return thrown; }
}