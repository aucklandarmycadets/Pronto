'use strict';

const Discord = require('discord.js');

module.exports = (prompt, colour) => {
	return new Discord.MessageEmbed()
		.setColor(colour)
		.setDescription(prompt);
};