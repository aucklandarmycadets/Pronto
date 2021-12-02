'use strict';

/**
 * @namespace handlers
 */
module.exports = {
	handlers: exports,
	channelPairing: require('./channelPairing'),
	commandHandler: require('./commandHandler'),
	commandLoader: require('./commandLoader'),
	confirmWithReaction: require('./confirmWithReaction'),
	database: require('./database'),
	findLesson: require('./findLesson'),
	lessonInstructions: require('./lessonInstructions'),
	lessonReminders: require('./lessonReminders'),
	manageAttendance: require('./manageAttendance'),
	mongoose: require('./mongoose'),
	createGuild: require('./createGuild'),
	overwriteCommands: require('./overwriteCommands'),
	permissionsCheck: require('./permissionsCheck'),
	permissionsHandler: require('./permissionsHandler'),
	removeGuild: require('./removeGuild'),
	unsubmittedLessons: require('./unsubmittedLessons'),
	upsertCommands: require('./upsertCommands'),
	updateUnsubmitted: require('./updateUnsubmitted'),
	verifyBotPermissions: require('./verifyBotPermissions'),
};