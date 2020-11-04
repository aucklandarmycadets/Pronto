'use strict';

const mongoose = require('mongoose');

const lessonSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	lessonID: String,
	lessonName: String,
	instructors: Object,
	dueDate: String,
	lessonDate: String,
	assignedResources: Array,
	submittedResources: Array,
	archiveID: String,
	submitted: Boolean,
	approved: Boolean,
	changed: Boolean,
});

module.exports = mongoose.model('lesson', lessonSchema, 'lessons');