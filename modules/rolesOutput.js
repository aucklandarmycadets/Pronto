'use strict';

const { ids: { administratorID } } = require('../config');

module.exports = (array, skipFormat) => {
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