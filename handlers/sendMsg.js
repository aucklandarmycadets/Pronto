'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
const { debugError } = require('../handlers');

/**
 *
 * @function handlers.sendMsg
 * @param {Discord.GuildTextBasedChannel} destination Destination channel
 * @param {string | Discord.MessagePayload | Discord.MessageOptions} options Message payload/options
 * @returns {Promise<?Discord.Message>} The message if it was successfully sent
 */
module.exports = async (destination, options) => await destination.send(options).catch(error => debugError(error, `Error sending message to ${destination}.`));