'use strict';

const Discord = require('discord.js');
const { debugError, dtg, formatAge, sendMsg } = require('../modules');

module.exports = {
	events: ['guildMemberAdd'],
	process: [],
	async handler(_, member) {
		const { bot } = require('../pronto');
		const { ids: { logID, recruitingID, newMembersID, visitorID }, colours } = await require('../handlers/database')(member.guild);

		const log = bot.channels.cache.get(logID);
		const newMembers = bot.channels.cache.get(newMembersID);
		const recruiting = bot.channels.cache.get(recruitingID);
		const memberUser = member.user;

		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setAuthor('Member Joined', memberUser.displayAvatarURL({ dynamic: true }))
			.setThumbnail(memberUser.displayAvatarURL({ dynamic: true }))
			.setDescription(`${memberUser} ${memberUser.tag}`)
			.addField('Account Age', formatAge(memberUser.createdAt))
			.setFooter(`ID: ${memberUser.id} | ${await dtg()}`);
		sendMsg(log, { embeds: [logEmbed] });

		if (memberUser.bot) return;

		const visitorRole = member.guild.roles.cache.find(role => role.id === visitorID);
		member.roles.add(visitorRole).catch(error => debugError(error, `Error adding ${member} to ${visitorRole}.`));

		const welcomeEmbed = new Discord.MessageEmbed()
			.setColor(colours.pronto)
			.setAuthor(memberUser.tag, memberUser.displayAvatarURL({ dynamic: true }))
			.setDescription(`**${memberUser} has just entered ${newMembers}.**\nMake them feel welcome!`)
			.setFooter(await dtg());
		sendMsg(recruiting, { embeds: [welcomeEmbed] });
	},
};