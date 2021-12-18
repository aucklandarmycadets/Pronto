'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { debugError, embedScaffold, findGuildConfiguration } = require('../handlers');

/** */

/**
 *
 * @function handlers.purgeChannel
 * @param {Discord.Collection<Discord.Snowflake, Discord.Message> | Discord.MessageResolvable[] | number} msgs Messages to delete
 * @param {Discord.GuildTextBasedChannel} channel Channel to purge
 * @param {Discord.ReactionCollector} [collector] An optional reaction collector to stop
 */
module.exports = async (msgs, channel, collector) => {
	const { colours } = await findGuildConfiguration(channel.guild);

	channel.bulkDelete(msgs)
		.catch(error => {
			embedScaffold(null, channel, `Error purging ${channel}.`, colours.error, 'MESSAGE');
			debugError(channel.guild, error, `Error purging ${channel}.`);
		});

	if (collector) collector.stop();
};