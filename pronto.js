'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const { mongoose } = require('./handlers');

const TOKEN = process.env.TOKEN;
const MONGOURI = process.env.MONGOURI;
exports.version = '4.2.2';

const bot = new Discord.Client({ partials: ['MESSAGE'] });

bot.login(TOKEN)
	.then(() => exports.bot = bot);

mongoose.login(MONGOURI);

const eventHandler = (emitter, event, handler) => emitter.on(event, (...args) => handler(event, ...args));

const events = require('./events');

Object.values(events).forEach(module => {
	if (module.events.length) module.events.forEach(event => eventHandler(bot, event, module.handler));
	if (module.process.length) module.process.forEach(event => eventHandler(process, event, module.handler));
});