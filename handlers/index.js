'use strict';

module.exports = {
	handlers: exports,
	botPermsHandler: require('./botPermsHandler')
	channelPairing: require('./channelPairing'),
	commandHandler: require('./commandHandler'),
	commandLoader: require('./commandLoader'),
	confirmation: require('./confirmation'),
	database: require('./database'),
	findLesson: require('./findLesson'),
	lessonInstructions: require('./lessonInstructions'),
	lessonReminders: require('./lessonReminders'),
	manageAttendance: require('./manageAttendance'),
	mongoose: require('./mongoose'),
	newGuild: require('./newGuild'),
	overwriteCommands: require('./overwriteCommands'),
	permissionsCheck: require('./permissionsCheck'),
	permissionsHandler: require('./permissionsHandler'),
	removeGuild: require('./removeGuild'),
	unsubmittedLessons: require('./unsubmittedLessons'),
	updateCommands: require('./updateCommands'),
	updateUnsubmitted: require('./updateUnsubmitted'),
};