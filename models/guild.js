'use strict';

const mongoose = require('mongoose');

const guildSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	guildID: String,
	guildName: String,
	config: Object,
	ids: Object,
	cmds: Object,
	emojis: Object,
	colours: Object,
});

module.exports = mongoose.model('Guild', guildSchema, 'guilds');