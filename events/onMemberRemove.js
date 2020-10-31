'use strict';

const Discord = require('discord.js');
const { dtg, rolesOutput, sendMsg } = require('../modules');

module.exports = {
	events: ['guildMemberRemove'],
	process: [],
	async execute(event, member) {
		const { bot } = require('../pronto');
		const { ids: { logID }, colours } = await require('../handlers/database')(member.guild);

		const log = bot.channels.cache.get(logID);
		const memberUser = member.user;
		const memberRoles = member.roles.cache.array();

		const logEmbed = new Discord.MessageEmbed()
			.setColor(colours.error)
			.setAuthor('Member Left', memberUser.displayAvatarURL())
			.setThumbnail(memberUser.displayAvatarURL())
			.setDescription(`${memberUser} ${memberUser.tag}`)
			.addField('Roles', rolesOutput(memberRoles, true))
			.setFooter(`ID: ${memberUser.id} | ${await dtg()}`);
		sendMsg(log, logEmbed);
	},
};