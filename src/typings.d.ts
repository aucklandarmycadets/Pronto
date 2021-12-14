import Discord = require('discord.js');
import mongoose = require('mongoose');

// <mongoose.Document> typings

export * from './models/attendance';
export * from './models/guild';
export * from './models/lesson';

// Command typings

export * from './commands/commands';

// Event typings

export * from './events/events';

// Configuration typings

import { Emoji, Colours } from './models/guild';

/**
 * The type of the required \<GuildChannel>
 */
export type DefaultChannelType = 'TEXT' | 'CATEGORY';

/**
 * An \<Object> containing the default configuration for Pronto
 */
export interface Configuration {
	/** The default settings object */
	settings: {
		/** The minimum \<Discord.Permissions> integer that Pronto requires */
		PERMISSIONS_INTEGER: Discord.PermissionResolvable,
		/** The default command prefix */
		prefix: string,
		/** The default dateformat mask for date-time groups */
		longDate: string,
		/** The default dateformat mask for shortened date strings */
		shortDate: string,
		/** The image URL to display as the default logo for Pronto */
		prontoLogo: string,
		/** The default cron expression for scheduled lesson reminders */
		lessonCron: string,
	}
	/** An \<Object> of constant identifiers/snowflakes that Pronto uses */
	ids: {
		/** The \<Guild.id> of the 'master' guild */
		DEFAULT_GUILD: Discord.Snowflake,
		/** The \<User.id> of the developer */
		DEVELOPER_ID: Discord.Snowflake,
	}
	/** An \<Object> of all the different channels/roles that Pronto recognises */
	defaults: {
		[key: string]: DefaultChannel | DefaultRole,
	}
	/** The default emojis object */
	emojis: {
		/** The default success \<Emoji> */
		success: Emoji,
		/** The default error \<Emoji> */
		error: Emoji,
	}
	/** The default \<Colours> object */
	colours: Colours,
}

/**
 * An \<Object> describing a \<GuildChannel> that Pronto requires
 */
export interface DefaultChannel {
	/** The name of the required \<GuildChannel> */
	name: string,
	/** The type of the required \<GuildChannel> */
	type: DefaultChannelType,
	/** The \<TextChannel.topic>of the channel for the created \<GuildChannel> */
	description: ?string,
	/** The name of the parent \<CategoryChannel> for the created \<GuildChannel> */
	parent: ?string,
}

/**
 * An \<Object> describing a \<Role> that Pronto recognises
 */
export interface DefaultRole {
	/** The name of the recognised \<Role> */
	name: string,
}