'use strict';

const Guild = require('../models/guild');

module.exports = guild => {
	Guild.findOneAndDelete({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});
};