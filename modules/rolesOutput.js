'use strict';

module.exports = array => {
	let rolesString = '';
	const filteredArray = array.filter(role => role.name !== '@everyone');

	for (let i = 0; i < filteredArray.length; i++) {
		if (i % 3 === 0) rolesString += '\n';

		(typeof filteredArray[i] === 'string')
			? rolesString += `<@&${filteredArray[i]}> `
			: rolesString += `${filteredArray[i]} `;
	}

	return rolesString;
};