'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');
const mongoose = require('mongoose');

const { settings, emojis, colours } = require('../config');

/**
 * @typedef {Typings.Guild} models.Guild An \<Object> representing the values of a \<mongoose.Document> to record the specific configuration for each \<Guild>
 * @property {mongoose.Schema.Types.ObjectId} _id A unique document identifier
 * @property {Discord.Snowflake} guildID The \<Guild.id> that this configuration belongs to
 * @property {string} guildName The \<Guild.name> that this configuration belongs to
 * @property {Object} settings The guild's settings object
 * @property {string} settings.prefix The guild's command prefix
 * @property {string} settings.longDate The guild's default dateformat mask for its date-time groups
 * @property {string} settings.shortDate The guild's dateformat mask for its shortened date strings
 * @property {string} settings.prontoLogo The image URL to display as the guild's logo for Pronto
 * @property {string} settings.lessonCron The guild's cron expression to schedule lesson reminders
 * @property {boolean} settings.lessonReminders A \<boolean> to control whether to schedule lesson reminders
 * @property {Object} ids The guild's object of identifiers/snowflakes
 * @property {Discord.Snowflake} ids.guildID The \<Guild.id> of the guild
 * @property {Discord.Snowflake} ids.debugID The \<TextChannel.id> of the guild's debugging channel
 * @property {Discord.Snowflake} ids.logID The \<TextChannel.id> of the guild's log channel
 * @property {Discord.Snowflake} ids.attendanceID The \<TextChannel.id> of the guild's attendance channel
 * @property {Discord.Snowflake} ids.recruitingID The \<TextChannel.id> of the guild's recruiting channel
 * @property {Discord.Snowflake} ids.welcomeID The \<TextChannel.id> of the guild's new members channel
 * @property {Discord.Snowflake} ids.archivedID The \<TextChannel.id> of the guild's debugging channel
 * @property {Discord.Snowflake} ids.lessonsID The \<CategoryChannel.id> of the guild's lesson plans category channel
 * @property {Discord.Snowflake} ids.lessonReferenceID The \<TextChannel.id> of the guild's lesson reference channel
 * @property {Discord.Snowflake} ids.lessonPlansID The \<TextChannel.id> of the guild's lesson plans archive channel
 * @property {Discord.Snowflake} ids.everyoneID The \<Role.id> of the guild's \@everyone role
 * @property {Discord.Snowflake} ids.visitorID The \<Role.id> of the guild's visitor role
 * @property {Discord.Snowflake | ''} ids.administratorID The \<Role.id> of the guild's administrator role if it is registered
 * @property {Discord.Snowflake[]} ids.trainingIDs A \<Role.id[]> of the guild's training roles
 * @property {Discord.Snowflake[]} ids.formations A \<Role.id[]> of the guild's formation roles
 * @property {Typings.ChannelPair[]} ids.channelPairs An {@link models.ChannelPair|<Object[]>} of the guild's pairings of \<VoiceChannel> and \<TextChannel>
 * @property {Typings.BaseCommands} commands The guild's [\<BaseCommands>]{@link commands.BaseCommands} object containing each individual [\<BaseCommand>]{@link commands.BaseCommand} under the property [{@link commands.CommandName|CommandName}]
 * @property {Object} emojis The guild's emojis object
 * @property {Typings.Emoji} emojis.success The guild's success [\<Emoji>]{@link models.Emoji}
 * @property {Typings.Emoji} emojis.error The guild's error [\<Emoji>]{@link models.Emoji}
 * @property {Typings.Colours} colours The guild's colour [\<Object>]{@link models.Colours}
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
 * @property {number} default The colour to use as the guild's non-specific colour
 * @property {number} primary The colour to use as the guild's primary colour
 * @property {number} leave The colour to use on the guild's leave tickets
 * @property {number} success The colour to use as the guild's success colour
 * @property {number} warn The colour to use as the guild's warning colour
 * @property {number} error The colour to use as the guild's error colour
 */

// Create a new <Schema> of <Guild> type
const guildSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guildID: String,
	guildName: String,
	settings: {
		prefix: { type: String, default: settings.prefix },
		longDate: { type: String, default: settings.longDate },
		shortDate: { type: String, default: settings.shortDate },
		prontoLogo: { type: String, default: settings.prontoLogo },
		lessonCron: { type: String, default: settings.lessonCron },
		lessonReminders: { type: Boolean, default: false },
	},
	ids: {
		guildID: String,
		debugID: String,
		logID: String,
		attendanceID: String,
		recruitingID: String,
		welcomeID: String,
		archivedID: String,
		lessonsID: String,
		lessonReferenceID: String,
		lessonPlansID: String,
		everyoneID: String,
		visitorID: String,
		administratorID: { type: String, default: '' },
		trainingIDs: Array,
		formations: Array,
		channelPairs: Array,

	},
	commands: Object,
	emojis: {
		type: Object,
		default: {
			success: {
				name: emojis.success.name,
				URL: emojis.success.URL,
			},
			error: {
				name: emojis.error.name,
				URL: emojis.error.URL,
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