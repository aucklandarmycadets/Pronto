'use strict';

const Discord = require('discord.js');

const { colours } = require('../config');
const { cmds: { ping } } = require('../cmds');
const { dtg, sendMsg } = require('../modules');

module.exports = ping;
module.exports.execute = msg => {
	const { version } = require('../pronto');

	let pingValue = 'Pinging...';

	sendMsg(msg.channel, '**Pong!**')
		.then(reply => {
			const pingTimestamp = (msg.editedTimestamp - msg.createdTimestamp > 0)
				? msg.editedTimestamp
				: msg.createdTimestamp;

			pingValue = reply.createdTimestamp - pingTimestamp;
			const pingEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setFooter(`${pingValue} ms | ${dtg()} | Pronto v${version}`);
			reply.edit(pingEmbed);
		});
};