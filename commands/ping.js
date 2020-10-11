const Discord = require('discord.js');
const dateFormat = require('dateformat');

const { config: { dateOutput }, colours } = require('../config');
const { cmds: { ping } } = require('../cmds');
const { debugError } = require('../modules');

module.exports = ping;
module.exports.execute = msg => {
	'use strict';

	const { version } = require('../pronto');

	let pingValue = 'Pinging...';

	msg.channel.send('**Pong!**')
		.then(reply => {
			pingValue = reply.createdTimestamp - msg.createdTimestamp;
			const pingEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setFooter(`${pingValue} ms | ${dateFormat(dateOutput)} | Pronto v${version}`);
			reply.edit(pingEmbed);
		})
		.catch(error => debugError(error, `Error sending message to ${msg.channel}.`));
};