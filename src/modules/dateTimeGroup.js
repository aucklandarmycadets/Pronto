'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');

const dateFormat = require('dateformat');
const { findGuildConfiguration } = require('../handlers');

/**
 * `modules.dateTimeGroup()` formats a date-time group for the specified date, or the current date if no date is provided
 *
 * @example
 * // <GuildConfiguration.settings.longDate> = 'HHMM "h" ddd, d mmm yy'
 *
 * // returns '2121 h Tue, 21 Sep 21'
 * modules.dateTimeGroup(null, 1632216060000);
 *
 * @function modules.dateTimeGroup
 * @param {?Discord.Guild} [guild] The \<Guild> to format the date-time group for
 * - If `null` || `undefined`, the \<GuildConfiguration> of the default guild defined by [`config.ids.DEFAULT_GUILD`]{@link config.Configuration} will be used instead
 * @param {string | number | Date} [date=Date.now()] A Date object, or a [resolvable date]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#parameters} accepted by the `Date()` constructor, such as:
 * - A Unix timestamp as a \<string> | \<number>
 * - A string such as `09:00 1 Aug 2021`
 * - If `undefined`, the current date will be used
 * @returns {Promise<string>} The date-time group, formatted with the [`<GuildConfiguration.settings.longDate>`]{@link models.GuildConfiguration} of the specified guild
 */
module.exports = async (guild, date = Date.now()) => {
	const { settings: { longDate } } = await findGuildConfiguration(guild);
	// Format the date-time group using dateformat and return it
	return dateFormat(date, longDate);
};