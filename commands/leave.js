const dateFormat = require('dateformat');
const modules = require('../modules');

const leaveEmbedTitle = 'Leave Request';

module.exports = {
	name: modules.cmdList.leaveCmd,
	description: modules.cmdTxt.leaveDesc,
	execute(Discord, bot, msg, args) {
		'use strict';

		if (msg.member.roles.cache.some(roles => modules.constObj.nonCadet.includes(roles.id))) {
			bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
			return;
		}

		if (args.length === 0) {
			modules.sendErrorEmbed(Discord, bot, msg, 'Insufficient arguments.', modules.helpObj.errorLeave);
		}

		else {
			msg.react(msg.guild.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji))
				.catch(error => modules.debugError(Discord, bot, error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

			const attendanceEmbed = new Discord.MessageEmbed()
				.setTitle(leaveEmbedTitle)
				.setColor(modules.constObj.red)
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setDescription(`${msg.author} has requested leave in ${msg.channel}`)
				.addFields(
					{ name: 'Date', value: dateFormat(msg.createdAt, modules.constObj.dateOutput) },
					{ name: 'Details', value: modules.capitalise(args.join(' ')) },
				);

			const dmEmbed = new Discord.MessageEmbed()
				.setTitle(leaveEmbedTitle)
				.setColor(modules.constObj.red)
				.setAuthor(msg.guild.name, msg.guild.iconURL())
				.setDescription(`Hi ${msg.author}, your submission of leave has been received.`)
				.addFields(
					{ name: 'Date', value: dateFormat(msg.createdAt, modules.constObj.dateOutput) },
					{ name: 'Channel', value: msg.channel.toString() },
					{ name: 'Details', value: modules.capitalise(args.join(' ')) },
				);

			bot.channels.cache.get(modules.constObj.attendanceID).send(attendanceEmbed);
			msg.author.send(dmEmbed).catch(error => modules.dmError(Discord, bot, msg, error));
		}
	},
};