'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { findGuildConfiguration } = require('../handlers');

/**
 * `modules.prefixCommand()` applies the specified guild's command prefix to a \<BaseCommand>'s command
 * @example
 * // guild = <Guild>
 * // <GuildConfiguration.settings.prefix> = '!'
 *
 * const { help } = await require('../commands/commands')(guild);
 *
 * // returns '!help'
 * modules.prefixCommand(help, guild);
 * @function modules.prefixCommand
 * @param {Typings.BaseCommand} command The \<BaseCommand> of the command to prefix
 * @param {Discord.Guild} [guild] The \<Guild> to retrieve the command prefix from
 * - If `undefined`, the [`<GuildConfiguration.settings.prefix>`]{@link models.GuildConfiguration} of the default guild defined by [`config.ids.DEFAULT_GUILD`]{@link config.Configuration} will be used instead
 * @returns {Promise<string>} The prefixed command
 */
module.exports = async (command, guild) => {
	const { settings: { prefix } } = await findGuildConfiguration(guild);
	// Return the prefixed <BaseCommand.command>
	return `${prefix}${command.command}`;
};