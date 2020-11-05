'use strict';

const Discord = require('discord.js');
const Lesson = require('../models/lesson');

const { checkURL, cmdError, debugError, delMsg, dtg, outputResources, processResources, remove, rolesOutput, sendDM, sendMsg, successReact } = require('../modules');
const { confirmation } = require('../handlers');

const awaitingConfirm = new Set();

module.exports = async guild => {
	const { ids: { lessonsID, lessonPlansID, trainingIDs }, cmds: { lesson }, colours, emojis } = await require('../handlers/database')(guild);

	lesson.execute = async (msg, args, msgCmd) => {
		const { bot } = require('../pronto');

		let lessonDB = await Lesson.findOne({ lessonID: msg.channel.id }, error => {
			if (error) console.error(error);
		});

		const cmd = (lesson.aliases.includes(msgCmd))
			? msgCmd
			: args.shift().toLowerCase();

		const att = msg.attachments.first();
		const URLs = [];

		try {
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			else if (!lessonDB) throw 'Invalid lesson channel.';

			else if (!lessonDB.instructors[msg.author.id]) throw 'You are not an instructor for this lesson!';

			else if (!lessonDB.instructors[msg.author.id].seen) {
				const seenEmbed = new Discord.MessageEmbed()
					.setColor(colours.success)
					.setDescription(`${msg.author} has confirmed receipt of this lesson warning.`)
					.setFooter(await dtg());
				sendMsg(msg.channel, seenEmbed);

				lessonDB.instructors[msg.author.id].seen = true;
				lessonDB.markModified('instructors');
				await lessonDB.save().catch(error => console.error(error));

				let allSeen = true;

				for (const value of Object.values(lessonDB.instructors)) {
					if (!value.seen) allSeen = false;
				}

				if (allSeen) {
					const allSeenEmbed = new Discord.MessageEmbed()
						.setColor(colours.success)
						.setDescription('All instructors have acknowledged receipt of this lesson warning.')
						.setFooter(await dtg());
					sendMsg(msg.channel, allSeenEmbed);
				}
			}

			if (cmd === 'add') {
				for (let i = 0; i < args.length; i++) { if (checkURL(args[i])) URLs.push(args[i]); }

				if (!att && !URLs.length) throw 'You must attach a file or enter a URL!';
			}

			else if (cmd === 'remove') {
				if (!lessonDB.submittedResources.length) throw 'There are no resources to remove.';
			}

			else if (cmd === 'submit') {
				if (!lessonDB.changed && !lessonDB.submitted) throw 'There is nothing to submit!';

				else if (!lessonDB.changed && lessonDB.submitted) throw 'There are no changes to submit.';

				else if (awaitingConfirm.has(lessonDB.lessonID)) throw 'This lesson has already been submitted and is pending confirmation in DMs.';
			}

			else if (!lesson.aliases.includes(cmd)) throw 'Invalid input.';
		}

		catch (error) { return cmdError(msg, error, lesson.error); }

		if (cmd === 'view') {
			successReact(msg);

			const lessonEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setColor(colours.pronto)
				.setTitle(`Lesson Preview - ${lessonDB.lessonName}`)
				.addField('Instructor(s)', processMentions(lessonDB.instructors))
				.addField('Lesson', lessonDB.lessonName)
				.addField('Lesson Plan Due', lessonDB.dueDate)
				.addField('Lesson Date', lessonDB.lessonDate)
				.addField('Resources', outputResources(lessonDB.submittedResources), 1024)
				.setFooter(await dtg());

			sendMsg(msg.channel, lessonEmbed);
		}

		else if (cmd === 'add') {
			successReact(msg);

			if (lessonDB.submittedResources.includes(processResources(att, URLs))) return;

			lessonDB.submittedResources.push(processResources(att, URLs));
			lessonDB.changed = true;
			lessonDB.approved = false;

			lessonDB.markModified('submittedResources');
			lessonDB.markModified('changed');
			lessonDB.markModified('approved');

			await lessonDB.save().catch(error => console.error(error));

			const updatedEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setColor(colours.success)
				.setTitle('Lesson Resources Updated')
				.setDescription(`${msg.author} has added a new resource to this lesson.`)
				.addField('Lesson', lessonDB.lessonName)
				.addField('Resources', outputResources(lessonDB.submittedResources))
				.setFooter(await dtg());

			sendMsg(msg.channel, updatedEmbed);
		}

		else if (cmd === 'remove') {
			const { resources, range } = removeResources(lessonDB);

			const resourcesEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setColor(colours.error)
				.setTitle('Remove a Lesson Resource')
				.addField('Lesson', lessonDB.lessonName)
				.addField('Resources', resources)
				.setFooter('Enter the corresponding serial for the resource you wish to remove, or \'cancel\' to exit.');

			sendMsg(msg.channel, resourcesEmbed);

			const delIndex = await msgPrompt(msg, range, colours);

			lessonDB.submittedResources = remove(lessonDB.submittedResources, null, Number(delIndex) - 1);
			lessonDB.changed = true;
			lessonDB.approved = false;

			lessonDB.markModified('submittedResources');
			lessonDB.markModified('changed');
			lessonDB.markModified('approved');

			lessonDB.save().catch(error => console.error(error));

			const updatedEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setColor(colours.success)
				.setTitle('Lesson Resources Updated')
				.setDescription(`${msg.author} has removed a resource from this lesson.`)
				.addField('Lesson', lessonDB.lessonName)
				.addField('Resources', outputResources(lessonDB.submittedResources))
				.setFooter(await dtg());

			sendMsg(msg.channel, updatedEmbed);
		}

		else if (cmd === 'submit') {
			delMsg(msg);

			awaitingConfirm.add(lessonDB.lessonID);

			const submitEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setColor(colours.warn)
				.setTitle(`Lesson Submission - ${lessonDB.lessonName}`)
				.addField('Instructor(s)', processMentions(lessonDB.instructors))
				.addField('Lesson', lessonDB.lessonName)
				.addField('Lesson Plan Due', lessonDB.dueDate)
				.addField('Lesson Date', lessonDB.lessonDate)
				.addField('Resources', outputResources(lessonDB.submittedResources), 1024)
				.setFooter('Use the reactions below to confirm or cancel.');

			sendDM(msg.author, submitEmbed)
				.then(dm => {
					const lessonSubmit = async () => {
						lessonDB.changed = false;
						lessonDB.submitted = true;

						lessonDB.markModified('changed');
						lessonDB.markModified('submitted');

						lessonDB.save().catch(error => console.error(error));

						awaitingConfirm.delete(lessonDB.lessonID);

						submitEmbed.setTitle(`Lesson Plan Submitted - ${lessonDB.lessonName}`);
						submitEmbed.setColor(colours.success);
						submitEmbed.setFooter(await dtg());

						sendMsg(msg.channel, submitEmbed);

						const linkTest = /\[Resource \d+\]/;
						const attFilter = /\[(.+)\]\((.+)\)/;

						const promises = [];

						promises.push(
							outputResources(lessonDB.submittedResources).forEach(res => {
								if (!linkTest.test(res)) promises.push(sendMsg(msg.channel, new Discord.MessageAttachment(res.match(attFilter)[2], res.match(attFilter)[1].replace(/\\/g, ''))));
							}),
						);

						await Promise.all(promises);

						const successEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

						const ackEmbed = new Discord.MessageEmbed()
							.setDescription(`Click the ${successEmoji} to approve this lesson plan.\n\nAlternatively, you can manually type \`!approve\`.`)
							.setColor(colours.pronto);

						sendMsg(msg.channel, rolesOutput(trainingIDs, true), ackEmbed)
							.then(async approveMsg => {
								await successReact(approveMsg);

								const filter = (reaction, user) => {
									const roles = msg.guild.members.cache.get(user.id).roles.cache;
									return reaction.emoji.name === emojis.success.name && roles.some(role => trainingIDs.includes(role.id));
								};

								const collector = approveMsg.createReactionCollector(filter, { dispose: true });

								collector.on('collect', async (reaction, user) => {
									lessonDB = await Lesson.findOne({ lessonID: msg.channel.id }, error => {
										if (error) console.error(error);
									});

									const lessonPlansChnl = msg.guild.channels.cache.get(lessonPlansID);

									if (!lessonDB.approved && !lessonDB.changed) {
										if (!lessonDB.archiveID) {
											sendMsg(lessonPlansChnl, submitEmbed)
												.then(async archiveMsg => {
													lessonDB.archiveID = archiveMsg.id;
													lessonDB.markModified('archiveID');
													await lessonDB.save().catch(error => console.error(error));
												});
										}

										else {
											let archiveMsg;
											const filterBy = message => message.id === lessonDB.archiveID;

											await lessonPlansChnl.messages.fetch()
												.then(messages => {
													archiveMsg = messages.filter(filterBy).first();
												})
												.catch(error => debugError(error, `Error fetching messages in ${lessonPlansChnl}.`));

											archiveMsg.edit(submitEmbed);
										}

										const approvedEmbed = new Discord.MessageEmbed()
											.setColor(colours.success)
											.setDescription(`${user} has approved this lesson plan.`)
											.setFooter(await dtg());
										sendMsg(msg.channel, approvedEmbed);

										lessonDB.approved = true;
										lessonDB.markModified('approved');

										await lessonDB.save().catch(error => console.error(error));

										collector.stop();
									}

									else if (!lessonDB.approved && lessonDB.changed) {
										const errorEmbed = new Discord.MessageEmbed()
											.setColor(colours.error)
											.setDescription(`${user} there are currently outstanding changes, please wait for the lesson to be submitted again.`)
											.setFooter(await dtg());
										sendMsg(msg.channel, errorEmbed);
									}
								});

								collector.on('end', async () => {
									const userReactions = approveMsg.reactions.cache.filter(reaction => reaction.users.cache.has(bot.user.id));

									try {
										for (const reaction of userReactions.values()) {
											await reaction.users.remove(bot.user.id);
										}
									}

									catch (error) {
										debugError(error, `Error removing reactions from message in ${msg.channel}.`);
									}
								});
							});
					};

					const lessonCancelled = () => awaitingConfirm.delete(lessonDB.lessonID);

					return confirmation(msg, dm, lessonSubmit, lessonCancelled);
				});
		}
	};

	return lesson;
};

function processMentions(obj) {
	let mentions = '';
	for (const mention of Object.values(obj)) { mentions += `<@!${mention.id}>\n`; }
	return mentions.replace(/\n+$/, '');
}

function removeResources(db) {
	let procArr = [];
	const linksArr = [];
	const attArr = [];
	const dbArr = [];
	let count = 1;

	for (let i = 0; i < db.submittedResources.length; i++) {
		procArr = procArr.concat(db.submittedResources[i].split('\n'));
	}

	for (let i = 0; i < procArr.length; i++) {
		if (procArr[i].substr(0, 10) === '[Resource]') {
			linksArr.push(`[Resource ${count}]${procArr[i].substring(10)}`);
			dbArr.push(`${procArr[i]}`);
			count++;
		}
		else attArr.push(`${procArr[i]}`);
	}

	db.submittedResources = attArr.concat(dbArr);
	db.markModified('submittedResources');
	db.save().catch(error => console.error(error));

	const outputArr = attArr.concat(linksArr);
	const range = [];

	for (let i = 0; i < outputArr.length; i++) {
		outputArr[i] = `\`${i + 1}\` ${outputArr[i]}`;
		range.push(i + 1);
	}

	return { resources: outputArr, range: range };
}

function promptEmbed(prompt, colour) {
	return new Discord.MessageEmbed()
		.setColor(colour)
		.setDescription(prompt);
}

async function msgPrompt(msg, range, colours) {
	const promises = [];
	const filter = message => message.author.id === msg.author.id;
	promises.push(
		await msg.channel.awaitMessages(filter, { max: 1 })
			.then(collected => collected),
	);

	await Promise.all(promises);
	const reply = promises[0].first();

	try {
		if (reply.content.toLowerCase() === 'cancel') throw 'cancel';

		else if (!Number(reply.content)) {
			sendMsg(msg.channel, promptEmbed('You must enter a number.', colours.error), null, true);
			throw await msgPrompt(msg, range, colours);
		}

		else if (!range.includes(Number(reply.content))) {
			console.log(range);
			console.log(reply.content);
			sendMsg(msg.channel, promptEmbed(`You must enter a number between ${range[0]} and ${range[range.length - 1]}.`, colours.error), null, true);
			throw await msgPrompt(msg, range, colours);
		}

		throw reply.content;
	}

	catch (thrown) { return thrown; }
}