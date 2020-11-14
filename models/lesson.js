'use strict';

const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, default: mongoose.Types.ObjectId() },
	lessonID: String,
	lessonName: String,
	instructors: Object,
	dueDate: String,
	lessonDate: String,
	assignedResources: Array,
	submittedResources: Array,
	archiveID: String,
	submitted: { type: Boolean, default: false },
	approved: { type: Boolean, default: false },
	changed: { type: Boolean, default: false },
});

module.exports = mongoose.model('lesson', lessonSchema, 'lessons');