'use strict';

const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	channelID: String,
	attendanceID: String,
	name: String,
	formation: String,
	authors: Array,
});

module.exports = mongoose.model('attendance', attendanceSchema, 'attendances');