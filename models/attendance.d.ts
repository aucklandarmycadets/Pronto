import mongoose = require('mongoose');
import Discord = require('discord.js');

/**
 * An \<Object> representing the values of a \<mongoose.Document> to ensure attendance registers are only manageable by authorised users
 */
export interface Attendance extends mongoose.Document {
	/** A unique document identifier */
	_id: mongoose.Schema.Types.ObjectId;
	/** The \<Message.id> of the \<Message> sent to the original submission channel */
	channelID: Discord.Snowflake;
	/** The \<Message.id> of the \<Message> sent to the guild's attendance channel */
	attendanceID: Discord.Snowflake;
	/** The title of this attendance register */
	name: string;
	/** The name of the formation this register belongs to */
	formation: string;
	/** A \<User.id[]> of users that have contributed to this register */
	authors: Discord.Snowflake[];
}