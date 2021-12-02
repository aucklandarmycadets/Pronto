'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { commandLoader } = require('../handlers');

/**
 * Load the commands folder for the specified \<Guild> with handlers.commandLoader()
 * @module commands
 * @param {Discord.Guild} guild The \<Guild> to load commands for
 * @returns {Promise<Object.<string, Object.<string, string | string[] | boolean | Function>>>} The loaded commands object containing each of the guild's commands in a nested object
 */
module.exports = async guild => await commandLoader('./commands', guild);