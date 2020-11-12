'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');
const Lesson = require('../models/lesson');

const { checkURL, cmdError, debugError, delMsg, dtg, outputResources, processResources, promptEmbed, sendDM, sendMsg, successReact, titleCase } = require('../modules');
const { confirmation } = require('../handlers');

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

		sendDM(msg.author, assignEmbed, msg.channel);

		const neededInputs = {
			lessonName: {
				prompt: 'What is the name of the lesson?',
				type: 'txt',
			},
			dueDate: {
				prompt: 'When is the lesson plan due?',
				type: 'txt',
			},
			lessonDate: {
				prompt: 'When will the lesson be taught?',
				type: 'txt',
			},
			resources: {
				prompt: 'Provide any resources for the lesson if applicable.\n\nReply `done` when finished.',
				type: 'att',
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

			return sendDM(msg.author, cancelEmbed, null, true);
		}

		const { lessonName, dueDate, lessonDate, resources } = input;

		const lessonEmbed = new Discord.MessageEmbed()
			.setTitle(`Lesson Assignment - ${lessonName}`)
			.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
			.setColor(colours.warn)
			.addField('Instructor(s)', processMentions(memberMentions))
			.addField('Lesson', lessonName)
			.addField('Lesson Plan Due', dueDate)
			.addField('Lesson Date', lessonDate)
			.addField('Resources', outputResources(resources))
			.setFooter('Use the reactions below to confirm or cancel.');

		sendDM(msg.author, lessonEmbed, null, true)
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
							else lessonEmbed.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }));

							sendMsg(chnl, lessonEmbed);

							const successEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

							const ackEmbed = new Discord.MessageEmbed()
								.setDescription(`Click the ${successEmoji} to acknowledge receipt of this lesson warning.\n\nAlternatively, you can manually type \`!seen\`.`)
								.setColor(colours.pronto);

							sendMsg(chnl, processMentions(memberMentions), ackEmbed)
								.then(async seenMsg => {
									await successReact(seenMsg);

									const filter = (reaction, user) => reaction.emoji.name === emojis.success.name && memberMentions.has(user.id);
									const collector = seenMsg.createReactionCollector(filter, { dispose: true });

									collector.on('collect', async (_, user) => bot.commands.get(seen.cmd).execute(seenMsg, user));

									collector.on('end', async () => {
										const userReactions = seenMsg.reactions.cache.filter(reaction => reaction.users.cache.has(bot.user.id));

										try {
											const seenEmbed = new Discord.MessageEmbed()
												.setColor(colours.success)
												.setDescription('All instructors have acknowledged receipt of this lesson warning.')
												.setFooter(await dtg());
											sendMsg(chnl, seenEmbed);

											for (const reaction of userReactions.values()) {
												await reaction.users.remove(bot.user.id);
											}
										}

										catch (error) {
											debugError(error, `Error removing reactions from message in ${chnl}.`);
										}
									});
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
				lessonDate: lessonDate,
				assignedResources: outputResources(resources),
				submittedResources: [],
				archiveID: '',
				submitted: false,
				approved: false,
				changed: false,
			});

			return await lesson.save().catch(error => console.error(error));
		}
	};

	return assign;
};

async function inputs(msg, needed, colours) {
	const input = {};

	for (const [key, value] of Object.entries(needed)) {
		if (value.type === 'txt') input[key] = await msgPrompt(promptEmbed(value.prompt, colours.pronto), msg, value.type, colours);
		else input[key] = await whileLoop(promptEmbed(value.prompt, colours.pronto), msg, value.type, colours);

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
		sendDM(msg.author, prompt, null, true)
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
		if (type === 'txt') {
			if (!reply.content) {
				sendDM(msg.author, promptEmbed('You must enter something!', colours.error), null, true);
				throw await msgPrompt(prompt, msg, type, colours);
			}

			throw titleCase(reply.content);
		}

		else if (type === 'att') {
			if (reply.content.toLowerCase() === 'restart') throw 'restart';
			else if (reply.content.toLowerCase() === 'cancel') throw 'cancel';
			else if (reply.content.toLowerCase() === 'done') throw 'done';

			const args = reply.content.split(/ +/);
			const att = reply.attachments.first();
			const URLs = [];

			for (let i = 0; i < args.length; i++) { if (checkURL(args[i])) URLs.push(args[i]); }

			if (!att && !URLs.length) {
				sendDM(msg.author, promptEmbed('You must attach a file or enter a URL!', colours.error), null, true);
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