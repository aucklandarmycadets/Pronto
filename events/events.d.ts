import Discord = require('discord.js');

/**
 * The complete \<EventModule> object for one of Pronto's event modules
 */
export interface EventModule {
	/** A string[] of valid \<Client>#event(s) that this \<EventModule> applies to */
	bot: keyof Discord.ClientEvents[],
	/** A string[] of valid \<Process>#event(s) that this \<EventModule> applies to */
	process: string[],
	/** The event handler function to execute when specified event(s) are emitted */
	handler(...args): void,
}

/**
 * The complete \<EventModules> object for all of Pronto's event modules, where each \<EventHandler> is stored in the \<EventHandlers> object under a string property
 */
export interface EventModules {
	/** The event module's individual \<EventModule> object */
	[key: string]: EventModule;
}
