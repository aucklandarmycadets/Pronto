import mongoose = require('mongoose');
import Discord = require('discord.js');
import Typings = require('../typings');

/**
 * An \<Object> representing the values of a \<mongoose.Document> to record the specific configuration for each \<Guild>
 */
export interface GuildConfiguration extends mongoose.Document {
	/** A unique document identifier */
	_id: mongoose.Schema.Types.ObjectId;
	/** The \<Guild.id> that this configuration belongs to */
	guildId: Discord.Snowflake;
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
		/** The moment-timezone to schedule the guild's lesson reminders in */
		timezone: string,
		/** A \<boolean> to control whether to schedule lesson reminders */
		lessonReminders: boolean;
	};
	/** The guild's object of identifiers/snowflakes */
	ids: {
		/** The \<Guild.id> of the guild */
		guildId: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's debugging channel */
		debugId: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's log channel */
		logId: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's attendance channel */
		attendanceId: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's recruiting channel */
		recruitingId: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's new members channel */
		welcomeId: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's debugging channel */
		archivedId: Discord.Snowflake;
		/** The \<CategoryChannel.id> of the guild's lesson plans category channel */
		lessonsId: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's lesson reference channel */
		lessonReferenceId: Discord.Snowflake;
		/** The \<TextChannel.id> of the guild's lesson plans archive channel */
		lessonPlansId: Discord.Snowflake;
		/** The \<Role.id> of the guild's \@everyone role */
		everyoneId: Discord.Snowflake;
		/** The \<Role.id> of the guild's visitor role if it is registered */
		visitorId: Discord.Snowflake | '';
		/** The \<Role.id> of the guild's administrator role if it is registered */
		administratorId: Discord.Snowflake | '';
		/** A \<Role.id[]> of the guild's training roles */
		trainingIds: Discord.Snowflake[];
		/** A \<Role.id[]> of the guild's formation roles */
		formations: Discord.Snowflake[];
		/** An \<Object[]> of the guild's pairings of \<VoiceChannel> and \<TextChannel> */
		channelPairs: ChannelPair[];
	};
	/** The guild's \<BaseCommands> object containing each individual \<BaseCommand> under the property [CommandName] */
	commands: Typings.BaseCommands;
	/** The guild's emojis object */
	emojis: {
		/** The guild's success \<Emoji> */
		success: Emoji;
		/** The guild's error \<Emoji> */
		error: Emoji;
	};
	/** The guild's \<Colours> object */
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
	url: string;
}

/**
 * An \<Object> of the customisable colours for each guild
 */
export interface Colours {
	/** The colour to use as the guild's non-specific colour */
	default: Discord.ColorResolvable;
	/** The colour to use as the guild's primary colour */
	primary: Discord.ColorResolvable;
	/** The colour to use on the guild's leave tickets */
	leave: Discord.ColorResolvable;
	/** The colour to use as the guild's success colour */
	success: Discord.ColorResolvable;
	/** The colour to use as the guild's warning colour */
	warn: Discord.ColorResolvable;
	/** The colour to use as the guild's error colour */
	error: Discord.ColorResolvable;
}