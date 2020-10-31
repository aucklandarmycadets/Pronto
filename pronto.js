'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const { mongoose } = require('./handlers');

const TOKEN = process.env.TOKEN;
const MONGOURI = process.env.MONGOURI;
exports.version = '4.0.6';

const bot = new Discord.Client({ partials: ['MESSAGE'] });

bot.login(TOKEN)
	.then(() => exports.bot = bot);

mongoose.login(MONGOURI);

const eventHandler = (proc, event, mod) => proc.on(event, (...args) => mod.execute(event, ...args));

const botEvents = require('./events');

Object.keys(botEvents).map(key => {
	if (botEvents[key].events.length) botEvents[key].events.forEach(event => eventHandler(bot, event, botEvents[key]));
	if (botEvents[key].process.length) botEvents[key].process.forEach(event => eventHandler(process, event, botEvents[key]));
});