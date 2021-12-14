import mongoose = require('mongoose');
import Discord = require('discord.js');

/**
 * An \<Object> representing the values of a \<mongoose.Document> to record the details of each assigned lesson
 */
export interface Lesson extends mongoose.Document {
	/** A unique document identifier */
	_id: mongoose.Schema.Types.ObjectId;
	/** The \<TextChannel.id> of the private lesson channel created for the lesson */
	lessonId: Discord.Snowflake;
	/** The name of the lesson */
	lessonName: string;
	/** An \<Object> containing a nested \<Object> for each lesson instructor with their \<User.id> and acknowledgement status */
	instructors: Instructors;
	/** The formatted date-time group of the lesson plan's due date */
	dueDate: string;
	/** The Unix timestamp (ms) of the of the lesson plan's due date */
	dueTimestamp: number;
	/** The formatted date-time group of the lesson's date */
	lessonDate: string;
	/** The Unix timestamp (ms) of the lesson's date */
	lessonTimestamp: number;
	/** A \<string[]> of the lesson resources supplied to the instructor */
	assignedResources: string[];
	/** A \<string[]> of the lesson resources submitted by the instructor */
	submittedResources: string[];
	/** The \<Message.id> of the archived lesson plan, if it has been archived */
	archiveId?: Discord.Snowflake;
	/** A \<boolean> to record whether the lesson has been submitted at least once */
	submitted: boolean;
	/** A \<boolean> to record whether the lesson is approved in its current state */
	approved: boolean;
	/** A \<boolean> to record whether the lesson has unsubmitted changes */
	changed: boolean;
	/** 
	 * Create a formatted string of user mentions for the \<Lesson.instructors>
	 * @returns {string} A newline-delimited string of formatted user mentions
	 */
	processMentions(): string;
}

/**
 * An \<Object> containing a nested \<Object> for each lesson instructor with their \<User.id> and acknowledgement status
 */
export interface Instructors {
	/** The instructor's individual lesson instructor object */
	[key: Discord.Snowflake]: {
		/** The instructor's \<User.id> */
		id: Discord.Snowflake;
		/** Whether the instructor has acknowledged receipt of the lesson warning */
		seen: boolean;
	}
}