'use strict';

const Discord = require('discord.js');

module.exports = (att, URLs) => {
	const intialString = (att)
		? `[${Discord.escapeMarkdown(att.name)}](${att.url})\n`
		: '';

	return URLs.reduce((links, url) => links + `[Resource](${url})\n`, intialString)
		.replace(/\n+$/, '');
};