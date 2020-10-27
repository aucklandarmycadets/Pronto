'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const version = '3.4.1';
const bot = new Discord.Client({ partials: ['MESSAGE'] });

bot.commands = new Discord.Collection();
const botCommands = require('./commands');

Object.keys(botCommands).map(key => {
	bot.commands.set(botCommands[key].cmd, botCommands[key]);
});

const TOKEN = process.env.TOKEN;

bot.login(TOKEN)
	.then(() => module.exports = {
		bot: bot,
		version: version,
	});

const eventHandler = (proc, event, mod) => proc.on(event, (...args) => mod.execute(event, ...args));

const botEvents = require('./events');

Object.keys(botEvents).map(key => {
	if (botEvents[key].events.length) botEvents[key].events.forEach(event => eventHandler(bot, event, botEvents[key]));
	if (botEvents[key].process.length) botEvents[key].process.forEach(event => eventHandler(process, event, botEvents[key]));
});