'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { commandLoader } = require('../handlers');

/**
 * Load the commands folder for the specified guild with handlers.commandLoader()
 * @module commands
 * @param {Discord.Guild} guild The \<Guild> to load the \<Commands> for
 * @returns {Promise<Typings.Commands>} The guild's complete \<Commands> object
 */
module.exports = async guild => await commandLoader('./commands', guild);