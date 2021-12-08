'use strict';

/**
 * @namespace handlers
 */

module.exports = {
	handlers: exports,

	// mongoose/database handlers

	database: require('./database'),
	findLesson: require('./findLesson'),
	mongoose: require('./mongoose'),

	// <GuildConfiguration> handlers

	createGuild: require('./createGuild'),
	removeGuild: require('./removeGuild'),

	// Message sending handlers

	sendDirect: require('./sendDirect'),
	sendMsg: require('./sendMsg'),

	// Embed handlers

	createEmbed: require('./createEmbed'),
	embedScaffold: require('./embedScaffold'),

	// Command handlers

	commandHandler: require('./commandHandler'),
	overwriteCommands: require('./overwriteCommands'),
	upsertCommands: require('./upsertCommands'),

	// Permissions handlers

	permissionsCheck: require('./permissionsCheck'),
	permissionsHandler: require('./permissionsHandler'),
	verifyBotPermissions: require('./verifyBotPermissions'),

	// Error handlers

	commandError: require('./commandError'),
	debugError: require('./debugError'),
	directCommandError: require('./directCommandError'),
	getRoleError: require('./getRoleError'),

	// User confirmation handler

	confirmWithReaction: require('./confirmWithReaction'),

	// Emoji reaction handlers

	emojiReact: require('./emojiReact'),
	errorReact: require('./errorReact'),
	successReact: require('./successReact'),

	// Channel pairing handler

	channelPairing: require('./channelPairing'),

	// Message deletion handlers

	deleteMsg: require('./deleteMsg'),
	purgeChannel: require('./purgeChannel'),

	// Attendance management

	manageAttendance: require('./manageAttendance'),

	// Lesson management

	lessonInstructions: require('./lessonInstructions'),
	lessonReminders: require('./lessonReminders'),
	unsubmittedLessons: require('./unsubmittedLessons'),
	updateUnsubmitted: require('./updateUnsubmitted'),
};