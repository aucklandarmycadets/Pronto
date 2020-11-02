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
});

module.exports = mongoose.model('lesson', lessonSchema, 'lessons');