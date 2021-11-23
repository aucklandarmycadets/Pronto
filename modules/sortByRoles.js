'use strict';

module.exports = async guild => {
	const { ids: { administratorID } } = await require('../handlers/database')(guild);

	const highestRole = member => (member.roles.highest.id === administratorID)
		? member.roles.cache.filter(role => role.id !== administratorID).sort((roleOne, roleTwo) => roleOne.position - roleTwo.position).last()
		: member.roles.highest;

	return (memberOne, memberTwo) => highestRole(memberTwo).position - highestRole(memberOne).position;
};