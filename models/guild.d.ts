import mongoose = require('mongoose');
import Discord = require('discord.js');

/**
 * An \<Object> representing the values of a \<mongoose.Document> to record the specific configuration for each \<Guild>
 */
export interface Guild extends mongoose.Document {
	/** A unique document identifier */
	_id: mongoose.Schema.Types.ObjectId;
	/** The \<Guild.id> that this configuration belongs to */
	guildID: Discord.Snowflake;
	/** The \<Guild.name> that this configuration belongs to */
	guildName: string;
	/** The guild's settings object */
	settings: {
		/** The guild's command prefix */
		prefix: string;
		/** The guild's default dateformat mask for its date-time groups */
		longDate: string;
		/** The guild's dateformat mask for its shortened date strings */
		shortDate: string;
		/** The image URL to display as the guild's logo for Pronto */
		prontoLogo: string;
		/** The guild's cron expression to schedule lesson reminders */
		lessonCron: string;
		/** A \<boolean> to control whether to schedule lesson reminders */
		lessonReminders: boolean;
	};
	/** The guild's object of identifiers/snowflakes */
	ids: {
		/** The \<Guild.id> of the guild */
		guildID: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's debugging channel */
		debugID: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's log channel */
		logID: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's attendance channel */
		attendanceID: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's recruiting channel */
		recruitingID: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's new members channel */
		welcomeID: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's debugging channel */
		archivedID: Discord.Snowflake;
		/** The \<CategoryChannel.id> of the guild's lesson plans category channel */
		lessonsID: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's lesson reference channel */
		lessonReferenceID: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's lesson plans archive channel */
		lessonPlansID: Discord.Snowflake;
		/** The \<Role.id> of the guild's \@everyone role */
		everyoneID: Discord.Snowflake;
		/** The \<Role.id> of the guild's visitor role */
		visitorID: Discord.Snowflake;
		/** The \<Role.id> of the guild's administrator role if it is registered */
		administratorID: Discord.Snowflake | '';
		/** A \<Role.id[]> of the guild's training roles */
		trainingIDs: Discord.Snowflake[];
		/** A \<Role.id[]> of the guild's formation roles */
		formations: Discord.Snowflake[];
		/** An \<Object[]> of the guild's pairings of \<VoiceChannel> and \<TextChannel> */
		channelPairs: ChannelPair[];
	};
	/** The guild's commands object containing each individual command in a nested object */
	commands: Object.<string, Object.<string, string | string[] | boolean>>;
	/** The guild's emojis object */
	emojis: {
		/** The guild's success emoji */
		success: Emoji;
		/** The guild's error emoji */
		error: Emoji;
	};
	/** The guild's colour object */
	colours: Colours;
}

/**
 * An \<Object> of a pair of \<VoiceChannel.id> and \<TextChannel.id>
 */
interface ChannelPair {
	/** The \<VoiceChannel.id> of this paired voice channel */
	voice: Discord.Snowflake;
	/** The \<TextChannel.id> of this paired text channel */
	text: Discord.Snowflake;
}

/**
 * An \<Object> to create and/or find an emoji in a guild
 */
interface Emoji {
	/** The name of the guild's emoji */
	name: string;
	/** The URL of the guild's emoji */
	URL: string;
}

/**
 * An \<Object> of the customisable colours for each guild
 */
export interface Colours {
	/** The colour to use as the guild's non-specific colour */
	default: number;
	/** The colour to use as the guild's primary colour */
	primary: number;
	/** The colour to use on the guild's leave tickets */
	leave: number;
	/** The colour to use as the guild's success colour */
	success: number;
	/** The colour to use as the guild's warning colour */
	warn: number;
	/** The colour to use as the guild's error colour */
	error: number;
}