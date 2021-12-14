'use strict';

/**
 * @namespace modules
 */

module.exports = {
	modules: exports,

	// String methods

	charLimit: require('./charLimit'),
	sentenceCase: require('./sentenceCase'),
	titleCase: require('./titleCase'),

	// Array methods

	difference: require('./difference'),
	equals: require('./equals'),
	remove: require('./remove'),

	// Object methods

	merge: require('./merge'),

	// Type verification methods

	isURL: require('./isURL'),

	// Date/time formatting

	dateTimeGroup: require('./dateTimeGroup'),
	formatDuration: require('./formatDuration'),

	// Lesson resource management

	enumerateResources: require('./enumerateResources'),
	processResources: require('./processResources'),

	// Discord formatting methods

	extractID: require('./extractID'),
	jsCodeBlock: require('./jsCodeBlock'),

	// General formatting methods

	formatList: require('./formatList'),
	formatRoles: require('./formatRoles'),
	prefixCommand: require('./prefixCommand'),

	// Discord-related modules

	sortMembersByRoles: require('./sortMembersByRoles'),
	updatedPermissions: require('./updatedPermissions'),
};