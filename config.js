'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');

/**
 * @namespace config
 */

/**
 * @typedef {Object} config.Configuration An \<Object> containing the default configuration for Pronto
 * @property {Object} settings The default settings object
 * @property {Discord.PermissionResolvable} settings.PERMISSIONS_INTEGER The minimum \<Discord.Permissions> integer that Pronto requires
 * @property {string} settings.prefix The default command prefix
 * @property {string} settings.longDate The default dateformat mask for date-time groups
 * @property {string} settings.shortDate The default dateformat mask for shortened date strings
 * @property {string} settings.prontoLogo The image URL to display as the default logo for Pronto
 * @property {string} settings.lessonCron The default cron expression for scheduled lesson reminders
 * @property {Object} ids An \<Object> of constant identifiers/snowflakes that Pronto uses
 * @property {Discord.Snowflake} ids.DEFAULT_GUILD The \<Guild.id> of the 'master' guild
 * @property {Discord.Snowflake} ids.DEVELOPER_ID The \<User.id> of the developer
 * @property {Object.<string, config.DefaultChannel | config.DefaultRole>} defaults An \<Object> of all the different channels/roles that Pronto recognises
 * @property {Object} emojis The default emojis object
 * @property {models.Emoji} emojis.success The default success [\<Emoji>]{@link models.Emoji}
 * @property {models.Emoji} emojis.error The default error [\<Emoji>]{@link models.Emoji}
 * @property {models.Colours} colours The default [\<Colours>]{@link models.Colours} object
 * @property {mongoose.ConnectOptions} databaseOptions The \<mongoose.ConnectOptions> to use when connecting to the MongoDB database
 */

/**
 * @typedef {'TEXT' | 'CATEGORY'} config.DefaultChannelType The type of the required \<GuildChannel>
 */

/**
 * @typedef {Object} config.DefaultChannel An \<Object> describing a \<GuildChannel> that Pronto requires
 * @property {string} name The name of the required \<GuildChannel>
 * @property {config.DefaultChannelType} type The type of the required \<GuildChannel>
 * @property {?string} description The \<TextChannel.topic> of the channel for the created \<GuildChannel>
 * @property {?string} parent The name of the parent \<CategoryChannel> for the created \<GuildChannel>
 */

/**
 * @typedef {Object} config.DefaultRole An \<Object> describing a \<Role> that Pronto recognises
 * @property {string} name The name of the recognised \<Role>
 */

/**
 * @type {config.Configuration}
 */
module.exports = {
	settings: {
		PERMISSIONS_INTEGER: 1879141584,
		prefix: '!',
		longDate: 'HHMM "h" ddd, d mmm yy',
		shortDate: 'd mmm',
		prontoLogo: 'https://i.imgur.com/Whgm87R.png',
		lessonCron: '0 16 * * 3',
	},
	ids: {
		DEFAULT_GUILD: '765758073942966272',
		DEVELOPER_ID: '192181901065322496',
	},
	defaults: {
		debug: {
			name: 'debugging',
			type: 'TEXT',
			get description() {
				const { bot } = require('./pronto');
				return `For debugging <@!${bot.user.id}>.`;
			},
		},
		log: {
			name: 'log-channel',
			type: 'TEXT',
			description: 'Log channel.',
		},
		attendance: {
			name: 'attendance',
			type: 'TEXT',
			description: 'To assist in **recording attendance** and **monitoring leave**; leave tickets will be sent here.',
		},
		recruiting: {
			name: 'recruiting',
			type: 'TEXT',
			description: 'For everything related to **recruitment**.',
		},
		welcome: {
			name: 'welcome',
			type: 'TEXT',
			description: '**Introduce yourself!** You can ask us any questions you might have here, or just say hello!',
		},
		lessonReference: {
			name: 'reference',
			type: 'TEXT',
			get description() {
				const { bot } = require('./pronto');
				return `Reference channel for <@!${bot.user.id}>'s **lesson plans** feature set.`;
			},
			get parent() {
				const { defaults } = require('./config');
				return defaults.lessons.name;
			},
		},
		lessonPlans: {
			name: 'lesson-plans',
			type: 'TEXT',
			description: 'An archive of **completed** and **approved** lesson plans.',
			get parent() {
				const { defaults } = require('./config');
				return defaults.lessons.name;
			},
		},
		pronto: {
			name: 'Pronto',
			type: 'CATEGORY',
		},
		archived: {
			name: 'Archived',
			type: 'CATEGORY',
		},
		lessons: {
			name: 'Lesson Plans',
			type: 'CATEGORY',
		},
		visitor: {
			name: 'visitor',
		},
		administrator: {
			name: 'administrator',
		},
	},
	emojis: {
		success: {
			name: 'success',
			URL: 'https://i.imgur.com/OMi5RLT.png',
		},
		error: {
			name: 'error',
			URL: 'https://i.imgur.com/DW8EJJ7.png',
		},
	},
	colours: {
		default: 0x1b1b1b,
		primary: 0xffd456,
		leave: 0xd31145,
		success: 0x45bb8a,
		warn: 0xffcc4d,
		error: 0xef4949,
	},
	databaseOptions: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		autoIndex: false,
		family: 4,
	},
};