'use strict';

require('dotenv').config();

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('./typings');
const { mongoose } = require('./handlers');

/**
 * The Discord.js library to interact with the Discord API
 * @external Discord
 * @see https://discord.js.org/#/docs
 */

/**
 * The mongoose library to interact with the MongoDB API
 * @external mongoose
 * @see https://mongoosejs.com/docs
 */

/**
 * @namespace pronto
 */

// Create a new <Client>, and allow partial <Message> events
const bot = new Discord.Client({ partials: ['MESSAGE'] });

// Log the bot in, then export the <Client> object
bot.login(process.env.TOKEN)
	.then(() => {
		module.exports = {
			/**
			 * The bot's \<Client> object
			 * @memberof pronto
			 * @type {Typings.Client}
			 */
			bot,
			/**
			 * Pronto's current version
			 * @memberof pronto
			 * @type {string}
			 */
			version: '4.2.2',
		};
	});

// Log in to the MongoDB database
mongoose.login(process.env.MONGOURI);

/**
 * Attach an event listener to a \<Discord.Client> or \<NodeJS.Process> to execute an event handler
 * @function pronto~eventHandler
 * @param {Discord.Client | NodeJS.Process} emitter The \<EventEmitter> to add the event listener to
 * @param {string} event The event to listen for
 * @param {Typings.EventHandler} handler The event handler function to execute when the event is emitted
 */
const eventHandler = (emitter, event, handler) => emitter.on(event, (...args) => handler(event, ...args));

/**
 * Import the \<EventModules> object from the ./events folder
 * @type {Typings.EventModules}
 */
const events = require('./events');

// Iterate through each \<EventModule>
Object.values(events).forEach(module => {
	// Call eventHandler() for each <Client>#event in the module
	if (module.bot.length) module.bot.forEach(event => eventHandler(bot, event, module.handler));
	// Call eventHandler() for each <Process>#event in the module
	if (module.process.length) module.process.forEach(event => eventHandler(process, event, module.handler));
});