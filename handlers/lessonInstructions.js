'use strict';

const Discord = require('discord.js');

const { ids: { devID } } = require('../config');
const { pCmd, sendMsg } = require('../modules');

module.exports = async (id, guild) => {
	const { bot } = require('../pronto');
	const { cmds: { lesson, seen, assign, approve }, colours } = await require('../handlers/database')(guild);

	const instructionsChnl = bot.channels.cache.get(id);

	const instructorCmds = `
		\`${await pCmd(lesson)} view\` - Preview details and attached resources of an assigned lesson.
		\`${await pCmd(lesson)} add\` - Add a resource to a lesson.
		\`${await pCmd(lesson)} remove\` - Remove a resource from a lesson.
		\`${await pCmd(lesson)} submit\` - Submit a lesson for approval.
		\`${await pCmd(seen)}\` - ${seen.desc}
	`;

	const staffCmds = `
		\`${await pCmd(assign)}\` - ${assign.desc}
		\`${await pCmd(approve)}\` - ${approve.desc}
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
		\`${await pCmd(lesson)} add <URL>\`
		\`${await pCmd(lesson)} add\` with an attached file
	`;

	const addExample = `
		\`${await pCmd(lesson)} add https://www.cadetnet.org.nz/\`
		[Example of attaching a file](https://i.imgur.com/sUHIdTB.png)
	`;

	const removeField = `
		\`1.\` Type \`${await pCmd(lesson)} remove\`
		\`2.\` A serialised list of submitted resources will be outputted
		\`3.\` Reply with the serial of the resource you wish to remove
		[Example of removing a resource](https://i.imgur.com/QDgRc5F.png)
	`;

	const assignField = `
		\`1.\` Type \`${await pCmd(assign)} <user(s)>\`
		\`2.\` Respond to the prompts in DMs
	`;

	const dev = await bot.users.fetch(devID);

	const assignExample = `
		\`${await pCmd(assign)} @${dev.username}\`
		[Example of DM prompts](https://imgur.com/a/y6iO6d1)
	`;

	const usageEmbed = new Discord.MessageEmbed()
		.setAuthor(bot.user.tag, bot.user.avatarURL())
		.setTitle('Usage')
		.setColor(colours.pronto)
		.addField(`${await pCmd(lesson)} add`, addField, true)
		.addField('Example', addExample, true)
		.addField(`${await pCmd(lesson)} remove`, removeField)
		.addField(`${await pCmd(assign)}`, assignField, true)
		.addField('Example', assignExample, true);

	await sendMsg(instructionsChnl, { embeds: [instructionsEmbed] });
	await sendMsg(instructionsChnl, { embeds: [usageEmbed] });
	await sendMsg(instructionsChnl, { content: 'https://youtu.be/CKYvvE2ILAE' });
};