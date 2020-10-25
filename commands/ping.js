const Discord = require('discord.js');

const { colours } = require('../config');
const { cmds: { ping } } = require('../cmds');
const { dtg, debugError } = require('../modules');

module.exports = ping;
module.exports.execute = msg => {
	'use strict';

	const { version } = require('../pronto');

	let pingValue = 'Pinging...';

	msg.channel.send('**Pong!**')
		.then(reply => {
			const pingTimestamp = (msg.editedTimestamp - msg.createdTimestamp > 0)
				? msg.editedTimestamp
				: msg.createdTimestamp;

			pingValue = reply.createdTimestamp - pingTimestamp;
			const pingEmbed = new Discord.MessageEmbed()
				.setColor(colours.success)
				.setFooter(`${pingValue} ms | ${dtg()} | Pronto v${version}`);
			reply.edit(pingEmbed);
		})
		.catch(error => debugError(error, `Error sending message to ${msg.channel}.`));
};