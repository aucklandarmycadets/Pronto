'use strict';

const Discord = require('discord.js');

module.exports = (attachment, URLs) => {
	const initialString = (attachment)
		? `[${Discord.escapeMarkdown(attachment.name)}](${attachment.url})\n`
		: '';

	return initialString + URLs.map(url => `[Resource](${url})`).join('\n');
};