'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const { Lesson } = require('../models');

/** */

/**
 *
 * @function handlers.findLesson
 * @param {Discord.Snowflake} id
 * @returns {Promise<Typings.Lesson>}
 */
module.exports = async id => {
	return await Lesson.findOne({ lessonID: id }, error => {
		if (error) console.error(error);
	});
};