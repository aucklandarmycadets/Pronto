const dateFormat = require('dateformat');
const modules = require('../modules');

module.exports = {
	name: modules.cmdList.connectedCmd,
	description: modules.cmdTxt.connectedDesc,
	execute(Discord, bot, msg, args) {
		'use strict';

		if (!msg.member.roles.cache.some(roles => modules.constObj.sgtPlus.includes(roles.id))) {
			bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
			return;
		}

		if (msg.mentions.channels.size === 0) {
			modules.sendErrorEmbed(Discord, bot, msg, 'You must specify a voice channel.', modules.helpObj.errorConnected, 'Note: Use the <#channelID> syntax!');
		}

		else if (msg.mentions.channels.some(mention => mention.type !== 'voice')) {
			modules.sendErrorEmbed(Discord, bot, msg, 'Input must be a voice channel.', modules.helpObj.errorConnected, 'Note: Use the <#channelID> syntax!');
		}

		else if (msg.mentions.channels.size > 1) {
			modules.sendErrorEmbed(Discord, bot, msg, 'You can only display one channel at a time.', modules.helpObj.errorConnected, 'Note: Use the <#channelID> syntax!');
		}

		else {
			const connectedMembers = [];

			for (const [, member] of Object.entries(msg.mentions.channels.first().members.array())) {
				connectedMembers.push(member.toString());
			}

			if (connectedMembers.length === 0) {
				modules.sendErrorEmbed(Discord, bot, msg, `There are no members connected to ${msg.mentions.channels.first()}.`, modules.helpObj.errorConnected);
				return;
			}

			msg.react(msg.guild.emojis.cache.find(emoji => emoji.name === modules.constObj.successEmoji))
				.catch(error => modules.debugError(Discord, bot, error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));

			const connectedEmbed = new Discord.MessageEmbed()
				.setTitle(`Members Connected to #${msg.mentions.channels.first().name}`)
				.setColor(modules.constObj.success)
				.setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
				.setDescription(connectedMembers.join('\n'))
				.setFooter(`${dateFormat(msg.createdAt, modules.constObj.dateOutput)}`);
			bot.channels.cache.get(modules.constObj.attendanceID).send(connectedEmbed);
		}
	},
};