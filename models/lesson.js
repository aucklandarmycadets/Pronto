'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const mongoose = require('mongoose');

/**
 * @typedef {Object} models.Lesson An \<Object> representing the values of a \<mongoose.Document> to
 * @property {mongoose.Schema.Types.ObjectId} _id A unique document identifier
 * @property {Discord.Snowflake}
 */

// Create a new <Schema> of <Lesson> type
const lessonSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	lessonID: String,
	lessonName: String,
	instructors: Object,
	dueDate: String,
	dueTimestamp: Number,
	lessonDate: String,
	lessonTimestamp: Number,
	assignedResources: Array,
	submittedResources: Array,
	archiveID: String,
	submitted: { type: Boolean, default: false },
	approved: { type: Boolean, default: false },
	changed: { type: Boolean, default: false },
});

// Export the <Schema> as a <Model>
module.exports = mongoose.model('lesson', lessonSchema, 'lessons');