'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const bot = new Discord.Client({ partials: ['MESSAGE'] });

bot.events = new Discord.Collection();
const botEvents = require('./events');

Object.keys(botEvents).map(key => {
	bot.events.set(key, botEvents[key]);
});

bot.commands = new Discord.Collection();
const botCommands = require('./commands');

Object.keys(botCommands).map(key => {
	bot.commands.set(key, botCommands[key]);
});

const TOKEN = process.env.TOKEN;
const version = '3.0.3';

bot.login(TOKEN)
	.then(() => module.exports = {
		bot: bot,
		version: version,
	});

const eventHandler = (proc, event, mod) => proc.on(event, (...args) => mod.execute(event, ...args));

bot.events.forEach(mod => {
	if (mod.events.length) mod.events.forEach(event => eventHandler(bot, event, mod));
	if (mod.process.length) mod.process.forEach(event => eventHandler(process, event, mod));
});