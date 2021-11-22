'use strict';

const Discord = require('discord.js');

const { confirmation, findLesson, unsubmittedLessons } = require('../handlers');
const { checkURL, cmdError, delMsg, dtg, errorReact, outputResources, processResources, promptEmbed, remove, rolesOutput, sendDM, sendMsg, successReact } = require('../modules');

const awaitingConfirm = new Set();

module.exports = async guild => {
	const { ids: { lessonsID, trainingIDs }, cmds: { lesson, seen, approve }, colours, emojis } = await require('../handlers/database')(guild);

	lesson.execute = async (msg, args, msgCmd) => {
		const { bot } = require('../pronto');

		let _lesson = await findLesson(msg.channel.id);

		const cmd = (lesson.aliases.includes(msgCmd))
			? msgCmd
			: (args.length)
				? args.shift().toLowerCase()
				: null;

		const att = msg.attachments.first();
		const URLs = args.filter(arg => isURL(arg));

		try {
			if (msg.channel.parentID !== lessonsID) {
				const lessonsCategory = msg.guild.channels.cache.get(lessonsID);
				throw `You can only use that command in **${lessonsCategory}**.`;
			}

			else if (!_lesson) throw 'Invalid lesson channel.';

			else if (!_lesson.instructors[msg.author.id]) throw 'You are not an instructor for this lesson!';

			else if (!_lesson.instructors[msg.author.id].seen) _lesson = await bot.commands.get(seen.cmd).execute(msg, msg.author);

			if (cmd === 'add') {
				if (!att && !URLs.length) throw 'You must attach a file or enter a URL!';
			}

			else if (cmd === 'remove') {
				if (!_lesson.submittedResources.length) throw 'There are no resources to remove.';
			}

			else if (cmd === 'submit') {
				if (!_lesson.changed && !_lesson.submitted) throw 'There is nothing to submit!';

				else if (!_lesson.changed && _lesson.submitted) throw 'There are no changes to submit.';

				else if (awaitingConfirm.has(_lesson.lessonID)) throw 'This lesson has already been submitted and is pending confirmation in DMs.';
			}

			else if (!lesson.aliases.includes(cmd)) throw 'Invalid input.';
		}

		catch (error) { return cmdError(msg, error, lesson.error); }

		if (cmd === 'view') {
			successReact(msg);

			const lessonEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.pronto)
				.setTitle(`Lesson Preview - ${_lesson.lessonName}`)
				.addField('Instructor(s)', processMentions(_lesson.instructors))
				.addField('Lesson', _lesson.lessonName)
				.addField('Lesson Plan Due', _lesson.dueDate)
				.addField('Lesson Date', _lesson.lessonDate)
				.setFooter(await dtg());
				.addField('Resources', outputResources(_lesson.submittedResources, true))

			sendMsg(msg.channel, { embeds: [lessonEmbed] });
		}

		else if (cmd === 'add') {
			successReact(msg);

			if (_lesson.submittedResources.includes(processResources(att, URLs))) return;

			_lesson.submittedResources.push(processResources(att, URLs));
			_lesson.changed = true;
			_lesson.approved = false;

			await _lesson.save().catch(error => console.error(error));

			const updatedEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.success)
				.setTitle('Lesson Resources Updated')
				.setDescription(`**${msg.member.displayName}** has added a new resource to this lesson.`)
				.addField('Lesson', _lesson.lessonName)
				.setFooter(await dtg());
				.addField('Resources', outputResources(_lesson.submittedResources, true))

			sendMsg(msg.channel, { embeds: [updatedEmbed] });
		}

		else if (cmd === 'remove') {
			const { resources, range } = removeResources(_lesson);

			const resourcesEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.error)
				.setTitle('Remove a Lesson Resource')
				.addField('Lesson', _lesson.lessonName)
				.addField('Resources', resources.join('\n'))
				.setFooter('Enter the corresponding serial for the resource you wish to remove, or \'cancel\' to exit.');

			sendMsg(msg.channel, { embeds: [resourcesEmbed] });

			const delIndex = await msgPrompt(msg, range, colours);

			if (delIndex === 'cancel') {
				errorReact(msg);
				const cancelEmbed = new Discord.MessageEmbed()
					.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
					.setColor(colours.error)
					.setDescription('**Cancelled.**')
					.setFooter(await dateTimeGroup());

				return sendMsg(msg.channel, { embeds: [cancelEmbed] });
			}

			successReact(msg);
			_lesson.submittedResources = remove(_lesson.submittedResources, null, Number(delIndex) - 1);
			_lesson.changed = true;
			_lesson.approved = false;

			_lesson.save().catch(error => console.error(error));

			const updatedEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.success)
				.setTitle('Lesson Resources Updated')
				.setDescription(`**${msg.member.displayName}** has removed a resource from this lesson.`)
				.addField('Lesson', _lesson.lessonName)
				.setFooter(await dtg());
				.addField('Resources', outputResources(_lesson.submittedResources, true))

			sendMsg(msg.channel, { embeds: [updatedEmbed] });
		}

		else if (cmd === 'submit') {
			delMsg(msg);

			awaitingConfirm.add(_lesson.lessonID);

			const submitEmbed = new Discord.MessageEmbed()
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL({ dynamic: true }))
				.setColor(colours.warn)
				.setTitle(`Lesson Submission - ${_lesson.lessonName}`)
				.addField('Instructor(s)', processMentions(_lesson.instructors))
				.addField('Lesson', _lesson.lessonName)
				.addField('Lesson Plan Due', _lesson.dueDate)
				.addField('Lesson Date', _lesson.lessonDate)
				.addField('Resources', outputResources(_lesson.submittedResources, true))
				.setFooter('Use the reactions below to confirm or cancel.');

			sendDM(msg.author, { embeds: [submitEmbed] })
				.then(dm => {
					const lessonSubmit = async () => {
						_lesson.changed = false;
						_lesson.submitted = true;

						_lesson.save().catch(error => console.error(error));

						awaitingConfirm.delete(_lesson.lessonID);

						submitEmbed.setTitle(`Lesson Plan Submitted - ${_lesson.lessonName}`);
						submitEmbed.setColor(colours.success);
						submitEmbed.setFooter(await dtg());

						sendMsg(msg.channel, { embeds: [submitEmbed] });

						const linkTest = /\[Resource \d+\]/;
						const attFilter = /\[(.+)\]\((.+)\)/;

						const promises = [];

						promises.push(
							outputResources(_lesson.submittedResources).forEach(res => {
								if (!linkTest.test(res)) promises.push(sendMsg(msg.channel, { attachments: new Discord.MessageAttachment(res.match(attFilter)[2], res.match(attFilter)[1].replace(/\\/g, '')) }));
							}),
						);

						await Promise.all(promises);

						const successEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === emojis.success.name);

						const ackEmbed = new Discord.MessageEmbed()
							.setDescription(`Click the ${successEmoji} to approve this lesson plan.\n\nAlternatively, you can manually type \`!approve\`.`)
							.setColor(colours.pronto);

						sendMsg(msg.channel, { content: rolesOutput(trainingIDs, true), embeds: [ackEmbed] })
							.then(async approveMsg => {
								await successReact(approveMsg);

								const filter = async (reaction, user) => {
									const roles = await msg.guild.members.fetch(user.id).then(member => member.roles.cache);
									return reaction.emoji.name === emojis.success.name && roles.some(role => trainingIDs.includes(role.id));
								};

								const collector = approveMsg.createReactionCollector(filter, { dispose: true });

								collector.on('collect', async (_, user) => bot.commands.get(approve.cmd).execute(msg, user));
							});

						unsubmittedLessons(guild);
					};

					const lessonCancelled = () => awaitingConfirm.delete(_lesson.lessonID);

					return confirmation(msg, dm, lessonSubmit, lessonCancelled);
				});
		}
	};

	return lesson;
};

function processMentions(obj) {
	return Object.values(obj)
		.map(user => `<@!${user.id}>`)
		.join('\n');
}

function removeResources(lesson) {
	const processedArray = lesson.submittedResources.flatMap(resource => resource.split('\n'));

	const attachmentArray = processedArray.filter(resource => !resource.startsWith('[Resource]'));

	const dbArray = processedArray.filter(resource => resource.startsWith('[Resource]'));
	const urlArray = dbArray.map((resource, i) => `[Resource ${i + 1}]${resource.replace('[Resource]', '')}`);

	lesson.submittedResources = attachmentArray.concat(dbArray);
	lesson.save().catch(error => console.error(error));

	const resources = attachmentArray.concat(urlArray)
		.map((resource, i) => `\`${i + 1}\` ${resource}`);

	return { resources, range: resources.map((_, i) => i + 1) };
}

async function msgPrompt(msg, range, colours) {
	const collected = await msg.channel.awaitMessages(_msg => _msg.author.id === msg.author.id, { max: 1 });
	const reply = collected.first();

	try {
		if (reply.content.toLowerCase() === 'cancel') throw 'cancel';

		else if (isNaN(Number(reply.content))) {
			sendMsg(msg.channel, { embeds: [promptEmbed('You must enter a number.', colours.error)] });
			throw await msgPrompt(msg, range, colours);
		}

		else if (!range.includes(Number(reply.content))) {
			sendMsg(msg.channel, { embeds: [promptEmbed(`You must enter a number between ${range[0]} and ${range[range.length - 1]}.`, colours.error)] });
			throw await msgPrompt(msg, range, colours);
		}

		throw reply.content;
	}

	catch (thrown) { return thrown; }
}