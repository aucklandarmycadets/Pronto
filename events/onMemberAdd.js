const Discord = require('discord.js');

const { ids: { logID, recruitingID, newMembersID, visitorID }, colours } = require('../config');
const { dtg, sendMsg, formatAge, debugError } = require('../modules');

module.exports = {
	events: ['guildMemberAdd'],
	process: [],
	execute(event, member) {
		const { bot } = require('../pronto');

		const log = bot.channels.cache.get(logID);
		const newMembers = bot.channels.cache.get(newMembersID);
		const recruiting = bot.channels.cache.get(recruitingID);
		const memberUser = member.user;

		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.success)
			.setAuthor('Member Joined', memberUser.displayAvatarURL())
			.setThumbnail(memberUser.displayAvatarURL())
			.setDescription(`${memberUser} ${memberUser.tag}`)
			.addField('Account Age', formatAge(Date.now() - memberUser.createdAt))
			.setFooter(`ID: ${memberUser.id} | ${dtg()}`);
		sendMsg(log, logEmbed);

		if (memberUser.bot) return;

		const visitorRole = member.guild.roles.cache.find(role => role.id === visitorID);
		member.roles.add(visitorRole).catch(error => debugError(error, `Error adding ${member} to ${visitorRole}.`));

		const welcomeEmbed = new Discord.MessageEmbed()
			.setColor(colours.pronto)
			.setAuthor(memberUser.tag, memberUser.displayAvatarURL())
			.setDescription(`**${memberUser} has just entered ${newMembers}.**\nMake them feel welcome!`)
			.setFooter(`${dtg()}`);
		sendMsg(recruiting, welcomeEmbed);
	},
};