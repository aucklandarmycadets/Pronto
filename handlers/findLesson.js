'use strict';

const { Lesson } = require('../models');

module.exports = async id => {
	return await Lesson.findOne({ lessonID: id }, error => {
		if (error) console.error(error);
	});
};