'use strict';

module.exports = (array, mention) => {
	const { bot } = require('../pronto');

	let rolesString = '';
	const filteredArray = array.filter(role => role.name !== '@everyone');

	for (let i = 0; i < filteredArray.length; i++) {
		if (i % 3 === 0) rolesString += '\n';

		bot.guilds.cache.find(guild => {
			const roleObj = guild.roles.cache.find(role => role.id === filteredArray[i]);

			if (roleObj) {
				rolesString += (mention)
					? `${roleObj} `
					: `@${roleObj.name} `;
			}
		});
	}

	return rolesString;
};