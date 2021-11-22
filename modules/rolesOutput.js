'use strict';

module.exports = (array, mention, breakAt) => {
	const { bot } = require('../pronto');

	return array.filter(role => role.name !== '@everyone')
		.reduce((mentions, role, i) => {
			if (typeof role === 'string') role = bot.guilds.cache.find(guild => guild.roles.cache.get(role)).roles.cache.get(role);
			return mentions + `${(i % breakAt === 0) ? '\n' : ''}${(mention) ? `${role} ` : `@\u200b${role.name.replace('@', '')} `}`;
		}, '');
};