'use strict';

const mongoose = require('mongoose');
const { config, emojis, colours } = require('../config');

const guildSchema = mongoose.Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId() },
	guildID: { type: String, default: '' },
	guildName: { type: String, default: '' },
	config: {
		prefix: { type: String, default: config.prefix },
		dateOutput: { type: String, default: config.dateOutput },
		prontoLogo: { type: String, default: config.prontoLogo },
	},
	ids: {
		serverID: { type: String, default: '' },
		debugID: { type: String, default: '' },
		logID: { type: String, default: '' },
		attendanceID: { type: String, default: '' },
		recruitingID: { type: String, default: '' },
		newMembersID: { type: String, default: '' },
		archivedID: { type: String, default: '' },
		lessonsID: { type: String, default: '' },
		lessonPlansID: { type: String, default: '' },
		exampleTextID: { type: String, default: '' },
		exampleVoiceID: { type: String, default: '' },
		everyoneID: { type: String, default: '' },
		visitorID: { type: String, default: '' },
		administratorID: { type: String, default: '' },
		trainingIDs: { type: Array, default: [] },
		formations: { type: Array, default: [] },
		channelPairs: { type: Array, default: [] },

	},
	cmds: {
		type: Object,
		default: {},
	},
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