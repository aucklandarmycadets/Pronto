'use strict';

require('dotenv').config();
const Discord = require('discord.js');
const { mongoose } = require('./handlers');

// Export the bot's current version
exports.version = '4.2.2';

// Create a new <Client>, and allow partial <Message> events
const bot = new Discord.Client({ partials: ['MESSAGE'] });

// Log the bot in, then export the <Client> object
bot.login(process.env.TOKEN)
	.then(() => exports.bot = bot);

// Log in to the MongoDB database
mongoose.login(process.env.MONGOURI);

/**
 * Attach an event listener to a \<Discord.Client> or \<NodeJS.Process> to execute an event handler
 * @param {Discord.Client | NodeJS.Process} emitter The \<EventEmitter> to add the event listener to
 * @param {string} event The event to listen for
 * @param {Function} handler The event handler function to execute when the event is emitted
 */
const eventHandler = (emitter, event, handler) => emitter.on(event, (...args) => handler(event, ...args));

// Import the ./events folder
const events = require('./events');

// Iterate through each event file module
Object.values(events).forEach(module => {
	// Call eventHandler() for each <Client>#event in the module
	if (module.bot.length) module.bot.forEach(event => eventHandler(bot, event, module.handler));
	// Call eventHandler() for each <Process>#event in the module
	if (module.process.length) module.process.forEach(event => eventHandler(process, event, module.handler));
});