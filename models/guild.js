'use strict';

const mongoose = require('mongoose');
const { config, emojis, colours } = require('../config');

const guildSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guildID: String,
	guildName: String,
	config: {
		prefix: { type: String, default: config.prefix },
		dateOutput: { type: String, default: config.dateOutput },
		shortDate: { type: String, default: config.shortDate },
		prontoLogo: { type: String, default: config.prontoLogo },
		lessonCron: { type: String, default: config.lessonCron },
		lessonReminders: { type: Boolean, default: false },
	},
	ids: {
		serverID: String,
		debugID: String,
		logID: String,
		attendanceID: String,
		recruitingID: String,
		newMembersID: String,
		archivedID: String,
		lessonsID: String,
		lessonReferenceID: String,
		lessonPlansID: String,
		everyoneID: String,
		visitorID: String,
		administratorID: { type: String, default: '' },
		trainingIDs: Array,
		formations: Array,
		channelPairs: Array,

	},
	cmds: Object,
	emojis: {
		type: Object,
		default: {
			success: {
				name: emojis.success.name,
				URL: emojis.success.URL,
			},
			error: {
				name: emojis.error.name,
				URL: emojis.error.URL,
			},
		},
	},
	colours: {
		type: Object,
		default: {
			default: colours.default,
			pronto: colours.pronto,
			leave: colours.leave,
			success: colours.success,
			warn: colours.warn,
			error: colours.error,
		},
	},
});

module.exports = mongoose.model('Guild', guildSchema, 'guilds');