'use strict';

const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guildID: String,
	guildName: String,
	config: {
		prefix: String,
		dateOutput: String,
		prontoLogo: String,
	},
	ids: {
		serverID: String,
		debugID: String,
		logID: String,
		attendanceID: String,
		recruitingID: String,
		newMembersID: String,
		archivedID: String,
		exampleTextID: String,
		exampleVoiceID: String,
		everyoneID: String,
		visitorID: String,
		administratorID: String,
		formations: Array,
		nonCadet: Array,
		tacPlus: Array,
		sgtPlus: Array,
		cqmsPlus: Array,
		adjPlus: Array,
	},
	cmds: Object,
	emojis: {
		success: String,
		error: String,
	},
	colours: {
		default: Number,
		pronto: Number,
		leave: Number,
		success: Number,
		warn: Number,
		error: Number,
	},
});

module.exports = mongoose.model('Guild', guildSchema, 'guilds');