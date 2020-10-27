'use strict';

module.exports = async (array, guild, skipFormat) => {
	const { ids: { administratorID } } = await require('../handlers/database')(guild);

	let rolesString = '';
	const filteredArray = array.filter(role => role !== administratorID && role.name !== '@everyone');

	for (let i = 0; i < filteredArray.length; i++) {
		if (i % 3 === 0) rolesString += '\n';

		(skipFormat)
			? rolesString += `${filteredArray[i]} `
			: rolesString += `<@&${filteredArray[i]}> `;
	}

	return rolesString;
};