const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput, version }, colours } = require('../config');
const { cmds: { ping } } = require('../cmds');

module.exports = {
	cmd: ping.cmd,
	aliases: ping.aliases,
	description: ping.desc,
	allowDM: ping.allowDM,
	roles: ping.roles,
	noRoles: ping.noRoles,
	devOnly: ping.devOnly,
	help: ping.help,
	execute(msg) {
		'use strict';

		let pingValue = 'Pinging...';

		msg.channel.send('**Pong!**').then(reply => {
			pingValue = reply.createdTimestamp - msg.createdTimestamp;
			const pingEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setFooter(`${pingValue} ms | ${dateFormat(msg.createdAt, dateOutput)} | Pronto v${version}`);
			reply.edit(pingEmbed);
		});
	},
};