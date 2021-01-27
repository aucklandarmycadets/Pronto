'use strict';

const Discord = require('discord.js');
const Attendance = require('../models/attendance');

const { confirmation } = require('../handlers');
const { debugError, delMsg, dtg, embedScaffold, promptEmbed, sendDM } = require('../modules');

const pendingInput = new Set();

module.exports = {
	events: ['messageReactionAdd'],
	process: [],
	async execute(_, reaction, user) {
		const { bot } = require('../pronto');

		const { ids: { attendanceID }, colours } = await require('../handlers/database')(reaction.message.guild);

		if (user.bot) return;
		if (reaction.partial) await reaction.fetch();

		const db = await Attendance.findOne({ channelID: reaction.message.id });

		if (!db) return;

		const formation = reaction.message.guild.roles.cache.find(role => role.name === db.formation);

		if (!formation.members.some(member => member.id === user.id) && !db.authors.includes(user.id)) return reaction.users.remove(user.id);

		const attendanceChannel = bot.channels.cache.get(attendanceID);
		const attendanceMessage = await attendanceChannel.messages.fetch(db.attendanceID)
			.catch(error => debugError(error, `Error fetching messages in ${attendanceChannel}.`));

		if (reaction.emoji.name === '🗑️') {
			Attendance.findOneAndDelete({ channelID: reaction.message.id });
			delMsg(reaction.message);
			delMsg(attendanceMessage);
		}

		else if (reaction.emoji.name === '📝') {
			const createRegister = input => {
				const content = input.split('\n');
				const title = content.shift();
				const register = content.join('\n');

				const member = reaction.message.guild.members.cache.get(user.id);

				const attendanceEmbed = new Discord.MessageEmbed(reaction.message.embeds[0])
					.setTitle(`${title} (Updated)`)
					.setAuthor(db.formation, reaction.message.guild.iconURL())
					.setDescription(register)
					.setFooter('Use the reactions below to confirm or cancel.');

				sendDM(user, attendanceEmbed, reaction.message.channel)
					.then(dm => {
						const sendAttendance = async () => {
							attendanceEmbed.setAuthor(`${db.formation} (${member.displayName})`, reaction.message.guild.iconURL());
							attendanceEmbed.setFooter(`Last updated at ${await dtg()}`);

							attendanceMessage.edit(attendanceEmbed);
							reaction.message.edit(attendanceEmbed);

							embedScaffold(reaction.message.guild, reaction.message.channel, `${user} Successfully updated attendance for **[${title}](${reaction.message.url})**.`, colours.success, 'msg');

							db.name = title;
							if (!db.authors.includes(user.id)) db.authors.push(user.id);

							db.save();
						};

						confirmation(reaction.message, dm, sendAttendance);
					});
			};

			userInput(user, reaction.message, colours, createRegister);
			reaction.users.remove(user.id);
		}
	},
};

async function userInput(user, msg, colours, callback) {
	if (pendingInput.has(user.id)) return sendDM(user, promptEmbed('You\'re already editing another register!', colours.error), msg);

	const editingEmbed = new Discord.MessageEmbed()
		.setTitle(`Editing '${msg.embeds[0].title}'...`)
		.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
		.setColor(colours.success)
		.setDescription('Type `cancel` to exit.')
		.addField('Current Attendance', msg.embeds[0].description)
		.setFooter(await dtg());

	const dm = await sendDM(user, editingEmbed.addField('Message Link', `[${msg.embeds[0].title}](${msg.url})`), msg.channel);

	if (!dm) return;

	pendingInput.add(user.id);

	const input = await msgPrompt(promptEmbed('Please reply with your updated register.', colours.pronto), user, msg.channel, colours);

	if (input.toLowerCase() === 'cancel') {
		const { bot } = require('../pronto');

		const cancelEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setColor(colours.error)
			.setDescription('**Cancelled.**')
			.setFooter(await dtg());

		pendingInput.delete(user.id);

		return sendDM(user, cancelEmbed, msg.channel);
	}

	else callback(input);
}

async function msgPrompt(prompt, user, channel, colours) {
	const promises = [];
	const filter = message => message.author.id === user.id;

	promises.push(
		sendDM(user, prompt, channel)
			.then(async () => {
				promises.push(
					await user.dmChannel.awaitMessages(filter, { max: 1 })
						.then(collected => collected),
				);
			}),
	);

	await Promise.all(promises);
	const reply = promises[1].first();

	try {
		if (!reply.content) {
			sendDM(user, promptEmbed('You must enter something!', colours.error), null, true);
			throw await msgPrompt(prompt, user, channel, colours);
		}

		throw reply.content;
	}

	catch (thrown) { return thrown; }
}