'use strict';

const Discord = require('discord.js');

const { ids: { DEVELOPER_ID } } = require('../config');
const { prefixCmd, sendMsg } = require('../modules');

module.exports = async (id, guild) => {
	const { bot } = require('../pronto');
	const { cmds: { lesson, seen, assign, approve }, colours } = await require('../handlers/database')(guild);

	const instructionsChnl = bot.channels.cache.get(id);

	const instructorCmds = `
		\`${await prefixCmd(lesson)} view\` - Preview details and attached resources of an assigned lesson.
		\`${await prefixCmd(lesson)} add\` - Add a resource to a lesson.
		\`${await prefixCmd(lesson)} remove\` - Remove a resource from a lesson.
		\`${await prefixCmd(lesson)} submit\` - Submit a lesson for approval.
		\`${await prefixCmd(seen)}\` - ${seen.description}
	`;

	const staffCmds = `
		\`${await prefixCmd(assign)}\` - ${assign.description}
		\`${await prefixCmd(approve)}\` - ${approve.description}
	`;

	const instructionsEmbed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL())
		.setTitle('Instructions')
		.setDescription(`${bot.user} has a comprehensive collection of commands to assist with the assignment and production of lesson plans, with a simple system to manage lesson resources, supporting both file attachments and web links.`)
		.setColor(colours.pronto)
		.addField('Instructor Commands', instructorCmds)
		.addField('Training Staff Commands', staffCmds)
		.setFooter(`All lesson commands can be accessed directly without the '${lesson.cmd}' parent.`);

	const addField = `
		\`${await prefixCmd(lesson)} add <URL>\`
		\`${await prefixCmd(lesson)} add\` with an attached file
	`;

	const addExample = `
		\`${await prefixCmd(lesson)} add https://www.cadetnet.org.nz/\`
		[Example of attaching a file](https://i.imgur.com/sUHIdTB.png)
	`;

	const removeField = `
		\`1.\` Type \`${await prefixCmd(lesson)} remove\`
		\`2.\` A serialised list of submitted resources will be outputted
		\`3.\` Reply with the serial of the resource you wish to remove
		[Example of removing a resource](https://i.imgur.com/QDgRc5F.png)
	`;

	const assignField = `
		\`1.\` Type \`${await prefixCmd(assign)} <user(s)>\`
		\`2.\` Respond to the prompts in DMs
	`;

	const developer = await bot.users.fetch(DEVELOPER_ID);

	const assignExample = `
		\`${await prefixCmd(assign)} @${developer.username}\`
		[Example of DM prompts](https://imgur.com/a/y6iO6d1)
	`;

	const usageEmbed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL())
		.setTitle('Usage')
		.setColor(colours.pronto)
		.addField(`${await prefixCmd(lesson)} add`, addField, true)
		.addField('Example', addExample, true)
		.addField(`${await prefixCmd(lesson)} remove`, removeField)
		.addField(`${await prefixCmd(assign)}`, assignField, true)
		.addField('Example', assignExample, true);

	await sendMsg(instructionsChnl, { embeds: [instructionsEmbed] });
	await sendMsg(instructionsChnl, { embeds: [usageEmbed] });
	await sendMsg(instructionsChnl, { content: 'https://youtu.be/CKYvvE2ILAE' });
};