'use strict';

const { Guild } = require('../models');

module.exports = guild => {
	Guild.findOneAndDelete({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});
};