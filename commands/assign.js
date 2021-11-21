'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');

let chrono = require('chrono-node');
chrono = new chrono.Chrono(chrono.en.createConfiguration(false, true));

const Lesson = require('../models/lesson');

const { confirmation, unsubmittedLessons } = require('../handlers');
const { checkURL, cmdError, delMsg, dtg, outputResources, processResources, promptEmbed, sendDirect, sendMsg, successReact, titleCase } = require('../modules');

const recentlyAssigned = new Set();

module.exports = async guild => {
	const { ids: { lessonsID, trainingIDs }, cmds: { seen, assign }, colours, emojis } = await require('../handlers/database')(guild);

	assign.execute = async msg => {
		const { bot } = require('../pronto');

		const memberMentions = msg.mentions.members;
		const numMemberMentions = memberMentions.size;

		try {
			if (numMemberMentions === 0) throw 'You must tag a user.';

			else if (memberMentions.some(mention => mention.user.bot)) throw 'You cannot assign a lesson to a bot!';

			else if (recentlyAssigned.has(msg.author.id)) throw 'You are already assigning a lesson!';
		}

		catch (error) { return cmdError(msg, error, assign.error); }

		delMsg(msg);

		recentlyAssigned.add(msg.author.id);

		const assignEmbed = new Discord.MessageEmbed()
			.setTitle('Assigning Lesson...')
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.success)
			.setDescription('Type `restart` to start again, or `cancel` to exit.')
			.addField('Instructor(s)', processMentions(memberMentions))
			.setFooter(await dtg());

		sendDM(msg.author, { embeds: [assignEmbed] }, msg.channel);

		const neededInputs = {
			lessonName: {
				prompt: 'What is the name of the lesson?',
				type: 'txt',
				allowMultiple: false,
			},
			dueTimestamp: {
				prompt: 'When is the lesson plan due?',
				type: 'date',
				allowMultiple: false,
			},
			lessonTimestamp: {
				prompt: 'When will the lesson be taught?',
				type: 'date',
				allowMultiple: false,
			},
			resources: {
				prompt: 'Provide any resources for the lesson if applicable.\n\nReply `done` when finished.',
				type: 'att',
				allowMultiple: true,
			},
		};

		const input = await inputs(msg, neededInputs, colours);

		if (input === 'cancel') {
			const cancelEmbed = new Discord.MessageEmbed()
				.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
				.setColor(colours.error)
				.setDescription('**Cancelled.**')
				.setFooter(await dtg());

			recentlyAssigned.delete(msg.author.id);

			return sendDM(msg.author, { embeds: [cancelEmbed] }, null, true);
		}

		const { lessonName, dueTimestamp, lessonTimestamp, resources } = input;

		const dueDate = await dtg(dueTimestamp);
		const lessonDate = await dtg(lessonTimestamp);

		const lessonEmbed = new Discord.MessageEmbed()
			.setTitle(`Lesson Assignment - ${lessonName}`)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.warn)
			.addField('Instructor(s)', processMentions(memberMentions))
			.addField('Lesson', lessonName)
			.addField('Lesson Plan Due', dueDate)
			.addField('Lesson Date', lessonDate)
			.addField('Resources', outputResources(resources, true))
			.setFooter('Use the reactions below to confirm or cancel.');

		sendDM(msg.author, { embeds: [lessonEmbed] }, null, true)
			.then(dm => {
				const assignLesson = async () => {
					const everyone = guild.roles.everyone;

					const chnlOptions = { topic: processMentions(memberMentions), parent: lessonsID };

					await guild.channels.create(lessonName.replace('.', '-'), chnlOptions)
						.then(async chnl => {
							await chnl.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
							chnl.createOverwrite(everyone, { 'VIEW_CHANNEL': false });
							trainingIDs.forEach(staff => chnl.createOverwrite(staff, { 'VIEW_CHANNEL': true }));
							memberMentions.each(instructor => chnl.createOverwrite(instructor, { 'VIEW_CHANNEL': true }));

							saveLesson(chnl.id);

							recentlyAssigned.delete(msg.author.id);

							lessonEmbed.setTitle(`Lesson Warning - ${lessonName}`);
							lessonEmbed.setDescription('You have been assigned a lesson, use this channel to organise yourself.');
							lessonEmbed.setFooter(await dtg());

							if (numMemberMentions === 1) lessonEmbed.setAuthor(memberMentions.first().displayName, memberMentions.first().user.displayAvatarURL({ dynamic: true }));
							else lessonEmbed.setAuthor(guild.name, guild.iconURL({ dynamic: true }));

							await sendMsg(chnl, { embeds: [lessonEmbed] });
							unsubmittedLessons(guild);

							const successEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

							const ackEmbed = new Discord.MessageEmbed()
								.setDescription(`Click the ${successEmoji} to acknowledge receipt of this lesson warning.\n\nAlternatively, you can manually type \`!seen\`.`)
								.setColor(colours.pronto);

							sendMsg(chnl, { content: processMentions(memberMentions), embeds: [ackEmbed] })
								.then(async seenMsg => {
									await successReact(seenMsg);

									const filter = (reaction, user) => reaction.emoji.name === emojis.success.name && memberMentions.has(user.id);
									const collector = seenMsg.createReactionCollector(filter, { dispose: true });

									collector.on('collect', async (_, user) => bot.commands.get(seen.cmd).execute(seenMsg, user));



								});
						})
						.catch(error => console.error(`Error creating ${lessonName} in ${guild.name}\n`, error));
				};

				const assignCancelled = () => recentlyAssigned.delete(msg.author.id);

				return confirmation(msg, dm, assignLesson, assignCancelled);
			});

		async function saveLesson(channelID) {
			const instructors = {};

			memberMentions.each(mention => instructors[mention.id] = {
				id: mention.id,
				seen: false,
			});

			const lesson = await new Lesson({
				_id: mongoose.Types.ObjectId(),
				lessonID: channelID,
				lessonName: lessonName,
				instructors: instructors,
				dueDate: dueDate,
				dueTimestamp: dueTimestamp,
				lessonDate: lessonDate,
				lessonTimestamp: lessonTimestamp,
				assignedResources: outputResources(resources, true),
			});

			return await lesson.save().catch(error => console.error(error));
		}
	};

	return assign;
};

async function inputs(msg, needed, colours) {
	const input = {};

	for (const [key, value] of Object.entries(needed)) {
		if (value.allowMultiple) input[key] = await whileLoop(promptEmbed(value.prompt, colours.pronto), msg, value.type, colours, value.allowMultiple);
		else input[key] = await msgPrompt(promptEmbed(value.prompt, colours.pronto), msg, value.type, colours, value.allowMultiple);

		try {
			if (input[key].toLowerCase() === 'restart') return await inputs(msg, needed, colours);
			else if (input[key].toLowerCase() === 'cancel') return 'cancel';
		}
		catch { null; }
	}

	return input;
}

async function msgPrompt(prompt, msg, type, colours) {
	const promises = [];
	const filter = message => message.author.id === msg.author.id;
	promises.push(
		sendDM(msg.author, { embeds: [prompt] }, null, true)
			.then(async () => {
				promises.push(
					await msg.author.dmChannel.awaitMessages(filter, { max: 1 })
						.then(collected => collected),
				);
			}),
	);

	await Promise.all(promises);
	const reply = promises[1].first();

	try {
		if (type === 'txt' || type === 'date') {
			if (!reply.content) {
		if (input.content.toLowerCase() === 'restart') throw 'restart';
		else if (input.content.toLowerCase() === 'cancel') throw 'cancel';
		else if (input.content.toLowerCase() === 'done' && allowMultiple) throw 'done';
				sendDM(msg.author, { embeds: [promptEmbed('You must enter something!', colours.error)] }, null, true);
				throw await msgPrompt(prompt, msg, type, colours);
			}

			if (type === 'date') {

				const parsedDate = chrono.parseDate(reply.content);

				if (!parsedDate) {
					sendDM(msg.author, { embeds: [promptEmbed('I don\'t recognise that date, please try again.', colours.error)] }, null, true);
					throw await msgPrompt(prompt, msg, type, colours);
				}

				throw parsedDate.setHours(18, 0, 0, 0).valueOf();
			}

			throw titleCase(reply.content);
		}

		else if (type === 'att') {

			const args = reply.content.split(/ +/);
			const att = reply.attachments.first();
			const URLs = [];

			for (let i = 0; i < args.length; i++) { if (checkURL(args[i])) URLs.push(args[i]); }

			if (!att && !URLs.length) {
				sendDM(msg.author, { embeds: [promptEmbed('You must attach a file or enter a URL!', colours.error)] }, null, true);
				throw await msgPrompt(prompt, msg, type, colours);
			}

			throw processResources(att, URLs);
		}
	}

	catch (thrown) { return thrown; }
}

async function whileLoop(prompt, msg, type, colours) {
	const arr = [];

	async function loop() {
		const resource = await msgPrompt(prompt, msg, type, colours);

		if (resource.toLowerCase() === 'restart') return 'restart';
		else if (resource.toLowerCase() === 'cancel') return 'cancel';
		else if (resource.toLowerCase() === 'done') return arr;

		else {
			arr.push(resource);
			return await loop(prompt, msg, type);
		}
	}

	return await loop();
}

function processMentions(obj) {
	let mentions = '';
	obj.each(mention => mentions += `${mention}\n`);
	return mentions.replace(/\n+$/, '');
}