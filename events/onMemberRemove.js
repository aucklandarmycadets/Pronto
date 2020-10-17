const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput }, ids: { logID }, colours } = require('../config');
const { rolesOutput, sendMsg } = require('../modules');

module.exports = {
	events: ['guildMemberRemove'],
	process: [],
	execute(event, member) {
		const { bot } = require('../pronto');

		if (member.deleted) return;

		const log = bot.channels.cache.get(logID);
		const memberUser = member.user;
		const memberRoles = member.roles.cache.array();

		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error)
			.setAuthor('Member Left', memberUser.displayAvatarURL())
			.setThumbnail(memberUser.displayAvatarURL())
			.setDescription(`${memberUser} ${memberUser.tag}`)
			.addField('Roles', rolesOutput(memberRoles, true))
			.setFooter(`ID: ${memberUser.id} | ${dateFormat(dateOutput)}`);
		sendMsg(log, logEmbed);
	},
};