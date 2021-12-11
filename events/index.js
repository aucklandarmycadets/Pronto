'use strict';

// eslint-disable-next-line no-unused-vars
const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');

const fs = require('fs');

/**
 * @namespace events
 */

/**
 * @typedef {Object} events.EventModule The complete \<EventModule> object for one of Pronto's event module
 * @property {string[]} bot A string[] of valid \<Client>#event(s) that this \<EventModule> applies to
 * @property {string[]} process A string[] of valid \<Process>#event(s) that this \<EventModule> applies to
 * @property {events.EventHandler} handler The event handler function to execute when specified event(s) are emitted
 */

/**
 * @typedef {Object.<string, events.EventModule>} events.EventModules The complete \<EventModules> object for all of Pronto's event modules, where each [\<EventHandler>]{@link events.EventHandler} is stored in the \<EventHandlers> object under a string property
 */

/**
 * @typedef {function} events.EventHandler An event handler function to execute when specified event(s) are emitted
 * @param {string} event The event that was emitted
 * @param {...*} args The emitted arguments
 * @returns {void}
 */

/**
 * Load the events folder
 * @returns {Typings.EventModules} Pronto's complete \<EventModules> object
 */
module.exports = () => processIndex('./events');

/**
 * Load the bot's \<EventModules> from the specified directory
 * @function events.index~processIndex
 * @param {string} directory The directory to load each \<EventModule> from
 * @returns {Typings.EventModules} The loaded \<EventModules> object, containing each \<EventModule> in a nested object
 */
function processIndex(directory) {
	// Read the file names of every JavaScript file in the directory, other than the index file
	const files = fs.readdirSync(directory).filter(file => file.endsWith('.js') && file !== 'index.js');

	// For each <EventModule>, create a new nested object within the returned object under a property matching its file name
	return Object.fromEntries(
		files.map(file => {
			// Parse the name of the module from the file name
			const moduleName = file.replace('.js', '');
			// Create a [key, value] pair for the moduleName and the loaded <EventModule>
			return [moduleName, require(`.${directory}/${moduleName}`)];
		}),
	);
}