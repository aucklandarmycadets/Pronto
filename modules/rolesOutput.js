'use strict';

module.exports = (array, mention, breakAt) => {
	const { bot } = require('../pronto');

	let rolesString = '';
	const filteredArray = array.filter(role => role.name !== '@everyone');

	for (let i = 0; i < filteredArray.length; i++) {
		if (i % breakAt === 0) rolesString += '\n';

		const id = (typeof filteredArray[i] === 'string')
			? filteredArray[i]
			: filteredArray[i].id;

		bot.guilds.cache.find(guild => {
			const roleObj = guild.roles.cache.find(role => role.id === id);

			if (roleObj) {
				rolesString += (mention)
					? `${roleObj} `
					: `@${roleObj.name} `;
			}
		});
	}

	return rolesString;
};