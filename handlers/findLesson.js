'use strict';

const { Lesson } = require('../models');

/**
 *
 * @param {Discord.Snowflake} id
 * @returns {Promise<Lesson>}
 */
module.exports = async id => {
	return await Lesson.findOne({ lessonID: id }, error => {
		if (error) console.error(error);
	});
};