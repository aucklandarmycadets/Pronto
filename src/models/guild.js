'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');
const mongoose = require('mongoose');

const { settings, emojis, colours } = require('../config');

/**
 * @typedef {Typings.GuildConfiguration} models.GuildConfiguration An \<Object> representing the values of a \<mongoose.Document> to record the specific configuration for each \<Guild>
 * @property {mongoose.Schema.Types.ObjectId} _id A unique document identifier
 * @property {Discord.Snowflake} guildId The \<Guild.id> that this configuration belongs to
 * @property {string} guildName The \<Guild.name> that this configuration belongs to
 * @property {Object} settings The guild's settings object
 * @property {string} settings.prefix The guild's command prefix
 * @property {string} settings.longDate The guild's default dateformat mask for its date-time groups
 * @property {string} settings.shortDate The guild's dateformat mask for its shortened date strings
 * @property {string} settings.prontoLogo The image URL to display as the guild's logo for Pronto
 * @property {string} settings.lessonCron The guild's cron expression to schedule lesson reminders
 * @property {string} settings.timezone	The [moment-timezone]{@link https://momentjs.com/timezone/} to schedule the guild's lesson reminders in
 * @property {boolean} settings.lessonReminders A \<boolean> to control whether to schedule lesson reminders
 * @property {Object} ids The guild's object of identifiers/snowflakes
 * @property {Discord.Snowflake} ids.guildId The \<Guild.id> of the guild
 * @property {Discord.Snowflake} ids.debugId The \<TextChannel.id> of the guild's debugging channel
 * @property {Discord.Snowflake} ids.logId The \<TextChannel.id> of the guild's log channel
 * @property {Discord.Snowflake} ids.attendanceId The \<TextChannel.id> of the guild's attendance channel
 * @property {Discord.Snowflake} ids.recruitingId The \<TextChannel.id> of the guild's recruiting channel
 * @property {Discord.Snowflake} ids.welcomeId The \<TextChannel.id> of the guild's new members channel
 * @property {Discord.Snowflake} ids.archivedId The \<TextChannel.id> of the guild's debugging channel
 * @property {Discord.Snowflake} ids.lessonsId The \<CategoryChannel.id> of the guild's lesson plans category channel
 * @property {Discord.Snowflake} ids.lessonReferenceId The \<TextChannel.id> of the guild's lesson reference channel
 * @property {Discord.Snowflake} ids.lessonPlansId The \<TextChannel.id> of the guild's lesson plans archive channel
 * @property {Discord.Snowflake} ids.everyoneId The \<Role.id> of the guild's \@everyone role
 * @property {Discord.Snowflake | ''} ids.visitorId The \<Role.id> of the guild's visitor role if it is registered
 * @property {Discord.Snowflake | ''} ids.administratorId The \<Role.id> of the guild's administrator role if it is registered
 * @property {Discord.Snowflake[]} ids.trainingIds A \<Role.id[]> of the guild's training roles
 * @property {Discord.Snowflake[]} ids.formations A \<Role.id[]> of the guild's formation roles
 * @property {models.ChannelPair[]} ids.channelPairs An {@link models.ChannelPair|<Object[]>} of the guild's pairings of \<VoiceChannel> and \<TextChannel>
 * @property {commands.BaseCommands} commands The guild's [\<BaseCommands>]{@link commands.BaseCommands} object containing each individual [\<BaseCommand>]{@link commands.BaseCommand} under the property [{@link commands.CommandName|CommandName}]
 * @property {Object} emojis The guild's emojis object
 * @property {models.Emoji} emojis.success The guild's success [\<Emoji>]{@link models.Emoji}
 * @property {models.Emoji} emojis.error The guild's error [\<Emoji>]{@link models.Emoji}
 * @property {models.Colours} colours The guild's [\<Colours>]{@link models.Colours} object
 */

/**
 * @typedef {Object} models.ChannelPair An \<Object> of a pair of \<VoiceChannel.id> and \<TextChannel.id>
 * @property {Discord.Snowflake} voice The \<VoiceChannel.id> of this paired voice channel
 * @property {Discord.Snowflake} text The \<TextChannel.id> of this paired text channel
 */

/**
 * @typedef {Object} models.Emoji An \<Object> to create and/or find an emoji in a guild
 * @property {string} name The name of the guild's emoji
 * @property {string} URL The URL of the guild's emoji
 */

/**
 * @typedef {Object} models.Colours An \<Object> of the customisable colours for each guild
 * @property {Discord.ColorResolvable} default The colour to use as the guild's non-specific colour
 * @property {Discord.ColorResolvable} primary The colour to use as the guild's primary colour
 * @property {Discord.ColorResolvable} leave The colour to use on the guild's leave tickets
 * @property {Discord.ColorResolvable} success The colour to use as the guild's success colour
 * @property {Discord.ColorResolvable} warn The colour to use as the guild's warning colour
 * @property {Discord.ColorResolvable} error The colour to use as the guild's error colour
 */

// Create a new <Schema> of <Guild> type
const guildSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guildId: String,
	guildName: String,
	settings: {
		prefix: { type: String, default: settings.prefix },
		longDate: { type: String, default: settings.longDate },
		shortDate: { type: String, default: settings.shortDate },
		prontoLogo: { type: String, default: settings.prontoLogo },
		lessonCron: { type: String, default: settings.lessonCron },
		timezone: { type: String, default: settings.timezone },
		lessonReminders: { type: Boolean, default: false },
	},
	ids: {
		guildId: String,
		debugId: String,
		logId: String,
		attendanceId: String,
		recruitingId: String,
		welcomeId: String,
		archivedId: String,
		lessonsId: String,
		lessonReferenceId: String,
		lessonPlansId: String,
		everyoneId: String,
		visitorId: String,
		administratorId: { type: String, default: '' },
		trainingIds: Array,
		formations: Array,
		channelPairs: Array,

	},
	commands: Object,
	emojis: {
		type: Object,
		default: {
			success: {
				name: emojis.success.name,
				url: emojis.success.url,
			},
			error: {
				name: emojis.error.name,
				url: emojis.error.url,
			},
		},
	},
	colours: {
		type: Object,
		default: {
			default: colours.default,
			primary: colours.primary,
			leave: colours.leave,
			success: colours.success,
			warn: colours.warn,
			error: colours.error,
		},
	},
});

// Export the <Schema> as a <Model>
module.exports = mongoose.model('Guild', guildSchema, 'guilds');