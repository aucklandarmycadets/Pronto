'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const mongoose = require('mongoose');

/**
 * @typedef {Lesson} models.Lesson An \<Object> representing the values of a \<mongoose.Document> to record the details of each assigned lesson
 * @property {mongoose.Schema.Types.ObjectId} _id A unique document identifier
 * @property {Discord.Snowflake} lessonID The \<TextChannel.id> of the private lesson channel created for the lesson
 * @property {string} lessonName The name of the lesson
 * @property {Instructors} instructors An \<Object> containing a nested [\<Object>]{@link models.Instructors} for each lesson instructor with their \<User.id> and acknowledgement status
 * @property {string} dueDate The formatted date-time group of the lesson plan's due date
 * @property {number} dueTimestamp The Unix timestamp (ms) of the of the lesson plan's due date
 * @property {string} lessonDate The formatted date-time group of the lesson's date
 * @property {number} lessonTimestamp The Unix timestamp (ms) of the lesson's date
 * @property {string[]} assignedResources A \<string[]> of the lesson resources supplied to the instructor
 * @property {string[]} submittedResources A \<string[]> of the lesson resources submitted by the instructor
 * @property {?Discord.Snowflake} archiveID The \<Message.id> of the archived lesson plan, if it has been archived
 * @property {boolean} submitted A \<boolean> to record whether the lesson has been submitted at least once
 * @property {boolean} approved A \<boolean> to record whether the lesson is approved in its current state
 * @property {boolean} changed A \<boolean> to record whether the lesson has unsubmitted changes
 */

/**
 * @typedef {Object} models.Instructors An \<Object> containing a nested \<Object> for each lesson instructor with their \<User.id> and acknowledgement status
 * @property {Object.<Discord.Snowflake, {id: Discord.Snowflake, seen: boolean}>} Snowflake The instructor's individual lesson instructor object
 * @property {Discord.Snowflake} Snowflake.id The instructor's \<User.id>
 * @property {boolean} Snowflake.seen Whether the instructor has acknowledged receipt of the lesson warning
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