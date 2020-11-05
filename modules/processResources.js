'use strict';

const Discord = require('discord.js');

module.exports = (att, URLs) => {
	let linkString = '';

	if (att) linkString += `[${Discord.escapeMarkdown(att.name)}](${att.url})\n`;
	for (let i = 0; i < URLs.length; i++) linkString += `[Resource](${URLs[i]})\n`;

	return linkString.replace(/\n+$/, '');
};