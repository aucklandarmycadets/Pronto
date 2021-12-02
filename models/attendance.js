'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const mongoose = require('mongoose');

/**
 * @typedef {Attendance} models.Attendance An \<Object> representing the values of a \<mongoose.Document> to ensure attendance registers are only manageable by authorised users
 * @property {mongoose.Schema.Types.ObjectId} _id A unique document identifier
 * @property {Discord.Snowflake} channelID The \<Message.id> of the \<Message> sent to the original submission channel
 * @property {Discord.Snowflake} attendanceID The \<Message.id> of the \<Message> sent to the guild's attendance channel
 * @property {string} name The title of this attendance register
 * @property {string} formation The name of the formation this register belongs to
 * @property {Discord.Snowflake[]} authors A \<User.id[]> of users that have contributed to this register
 */

// Create a new <Schema> of <Attendance> type
const attendanceSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	channelID: String,
	attendanceID: String,
	name: String,
	formation: String,
	authors: Array,
});

// Export the <Schema> as a <Model>
module.exports = mongoose.model('attendance', attendanceSchema, 'attendances');