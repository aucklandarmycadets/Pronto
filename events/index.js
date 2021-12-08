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
 * @property {keyof Discord.ClientEvents[]} bot A string[] of valid \<Client>#event(s) that this \<EventModule> applies to
 * @property {string[]} process A string[] of valid \<Process>#event(s) that this \<EventModule> applies to
 * @property {Function} handler The event handler function to execute when specified event(s) are emitted
 */

/**
 * @typedef {Object.<string, events.EventModule>} events.EventModules The complete \<EventModules> object for all of Pronto's event module, where each [\<EventHandler>]{@link events.EventHandler} is stored in the \<EventHandlers> object under a string property
 */

/**
 * Load the events folder
 * @returns {Typings.EventModules}
 */
module.exports = processIndex('./events');

function processIndex(directory) {
	const files = fs.readdirSync(directory).filter(file => file.endsWith('.js') && file !== 'index.js');

	return Object.fromEntries(
		files.map(file => {
			const moduleName = file.replace('.js', '');
			return [moduleName, require(`.${directory}/${moduleName}`)];
		}),
	);
}