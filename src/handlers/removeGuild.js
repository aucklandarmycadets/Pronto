'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { Guild } = require('../models');

/** */

/**
 *
 * @function handlers.removeGuild
 * @param {Discord.Guild} guild The guild to delete from the database
 */
module.exports = guild => {
	Guild.findOneAndDelete({ guildID: guild.id }).exec()
		.catch(error => console.error(error));
};