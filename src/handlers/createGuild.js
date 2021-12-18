'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');
const mongoose = require('mongoose');

const { defaults, colours } = require('../config');
const { Guild } = require('../models');
const { dateTimeGroup } = require('../modules');
const { debugError, lessonInstructions, overwriteCommands, sendMsg } = require('../handlers');

/**
 * - Set to record the \<Guild.id> snowflakes of the guild currently undergoing creation
 * - If a guild's snowflake is currently in this set, they must await until the Promises stored within the values of pendingPromises[\<Guild.id>] resolve for the \<GuildConfiguration> document to be accessible
 * @type {Set<Discord.Snowflake>}
 * @memberof handlers.createGuild
 */
const currentlyCreating = new Set();

/**
 * - An \<Object> to record all current pending Promises, stored as an \<Object.\<string, Promise\<*>>> in the property pendingPromises[\<Guild.id>]
 * - A guild's \<GuildConfiguration> document is only guaranteed to be accessible once all Promises within `Object.values(pendingPromises[<Guild.id>])` have been resolved
 * @type {Object.<string, Object.<string, Promise<*>>>}
 * @memberof handlers.createGuild
 */
const pendingPromises = {};

/**
 * A Collection\<GuildChannel.Snowflake, Guild.Snowflake> to store any channels that have been created by Pronto as part of the current initialisation process(es)
 * @type {Discord.Collection<Discord.Snowflake, Discord.Snowflake>}
 * @memberof handlers.createGuild
 */
const createdChannels = new Discord.Collection();

/**
 * `handlers.createGuild()` performs the initialisation process for a guild by creating/finding the default channels defined by [`config.defaults`]{@link config.Configuration},
 * and creates and returns a new \<GuildConfiguration> document if it does not already exist
 * @function handlers.createGuild
 * @param {Discord.Guild} guild The \<Guild> to initialise
 * @returns {Promise<Typings.GuildConfiguration>} The guild's \<GuildConfiguration> document
 */
module.exports = async guild => {
	/**
	 * @type {?Typings.GuildConfiguration}
	 */
	// Attempt to find an existing <GuildConfiguration> document by querying for the guild's identifier
	const existingDocument = await Guild.findOne({ guildId: guild.id }).exec()
		.catch(error => console.error(error));

	// If the guild already has an existing <GuildConfiguration> document, return it and cease further execution
	if (existingDocument) return existingDocument;

	if (currentlyCreating.has(guild.id)) {
		// If the guild's identifier already exists inside the currentlyCreating set, await until the guild's pending Promises resolve for the <GuildConfiguration> document to be accessible
		await Promise.all(Object.values(pendingPromises[guild.id]));
		// Recursively call handlers.createGuild() to return the created <GuildConfiguration> document
		return await this(guild);
	}

	// Add the guild's identifier to the currentlyCreating set
	currentlyCreating.add(guild.id);

	const { bot } = require('../pronto');

	// Call createGuildDocument() to create the guild's initial Partial<GuildConfiguration> document, and wait for the document to be saved before proceeding
	// This is done by saving the Promise in an object within pendingPromises[guild.id], then waiting for that Promise to resolve
	pendingPromises[guild.id] = { createGuildDocument: createGuildDocument(guild) };
	await Promise.resolve(pendingPromises[guild.id].createGuildDocument);

	// Once the initial Partial<GuildConfiguration> document has been created, call handlers.overwriteCommands() to upsert <GuildConfiguration.commands>, and save the Promise
	pendingPromises[guild.id].overwriteCommands = overwriteCommands(guild);
	await Promise.resolve(pendingPromises[guild.id].overwriteCommands);

	// Once the handlers.overwriteCommands() Promise has resolved, retrieve the complete <GuildConfiguration> document from its resolved value
	const guildDocument = pendingPromises[guild.id].overwriteCommands;

	// Remove the guild's identifier from the currentlyCreating set now that the <GuildConfiguration> document has been created
	currentlyCreating.delete(guild.id);

	// Call handlers.lessonInstructions() to send an instructional embed on Pronto's lesson management functionality
	lessonInstructions(guildDocument.ids.lessonReferenceId, guild);

	// If this guild has had some channels created as part of the initialisation process, send an embed listing the created channels
	if (createdChannels.some(guildId => guildId === guild.id)) {
		// Retrieve the <CategoryChannel> that was created by Pronto to categorise Pronto's created channels
		const prontoCategory = bot.channels.cache.find(channel => channel.type === 'category' && channel.name === defaults.pronto.name);
		// Get the guild's debug channel
		const debugChannel = bot.channels.cache.get(guildDocument.ids.debugId);

		// Create created channels embed
		const createdChannelsEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setColor(colours.primary)
			.setDescription(`Initialised channel(s) in **${prontoCategory}**, feel free to move and/or rename them!`)
			// Call channelsOutput() to format the guild's created channels into a
			.addField('Created Channels', channelsOutput(createdChannels, guildDocument))
			.addField('More Information', 'To modify my configuration, please visit my dashboard.')
			.setFooter(await dateTimeGroup(guild));

		// Send the created channels embed
		sendMsg(debugChannel, { embeds: [createdChannelsEmbed] });
	}

	// Filter the createdChannels <Collection> for channels created in this guild, and delete them from the <Collection> now that we are done with them
	[...createdChannels.filter(guildId => guildId === guild.id).keys()]
		.forEach(channelId => createdChannels.delete(channelId));

	// Delete the guild's property from the pendingPromises <Object> now that we are done with it
	delete pendingPromises[guild.id];

	// Return the created <GuildConfiguration> document
	return guildDocument;
};

/**
 * Creates an initial Partial\<GuildConfiguration> without a \<GuildConfiguration.commands> \<BaseCommands> object, by calling `initialiseChannel()` and `findRole()` to populate the \<GuildConfiguration.ids> object
 * @function handlers.createGuild~createGuildDocument
 * @param {Discord.Guild} guild The \<Guild> to create a \<GuildConfiguration> document for
 * @returns {Promise<Typings.GuildConfiguration>} The created initial \<GuildConfiguration> document
 */
async function createGuildDocument(guild) {
	/**
	 * Create a new \<GuildConfiguration> document, by calling `initialiseChannel()` to find/create each necessary \<GuildChannel>, and `findRole()` to find desired existing roles
	 * @type {Typings.GuildConfiguration}
	 */
	const guildDocument = await new Guild({
		_id: new mongoose.Types.ObjectId(),
		guildId: guild.id,
		guildName: guild.name,
		ids: {
			guildId: guild.id,
			debugId: await initialiseChannel(defaults.debug, guild),
			logId: await initialiseChannel(defaults.log, guild),
			attendanceId: await initialiseChannel(defaults.attendance, guild),
			recruitingId: await initialiseChannel(defaults.recruiting, guild),
			welcomeId: await initialiseChannel(defaults.welcome, guild),
			archivedId: await initialiseChannel(defaults.archived, guild),
			lessonsId: await initialiseChannel(defaults.lessons, guild),
			lessonReferenceId: await initialiseChannel(defaults.lessonReference, guild),
			lessonPlansId: await initialiseChannel(defaults.lessonPlans, guild),
			everyoneId: guild.roles.everyone.id,
			visitorId: findRole(defaults.visitor, guild),
		},
	});

	// Return the created initial <GuildConfiguration> document
	return await guildDocument.save().catch(error => console.error(error));
}

/**
 * Finds an existing \<GuildChannel> that matches the specified \<DefaultChannel.name>, or creates the channel if it does not already exist
 * @function handlers.createGuild~initialiseChannel
 * @param {Typings.DefaultChannel} defaultChannel The \<DefaultChannel> object of the channel to find/create
 * @param {Discord.Guild} guild The \<Guild> to find/create the \<GuildChannel> in
 * @returns {Promise<Discord.Snowflake>} The \<GuildChannel.id> of the found/created channel
 */
async function initialiseChannel(defaultChannel, guild) {
	const { bot } = require('../pronto');

	/**
	 * A \<PermissionString[]> of the minimum permissions Pronto must have in an existing [`config.defaults.debug.name`]{@link config.Configuration} \<GuildChannel> to fully accept it as 'found', and to not create a new copy
	 * @type {Discord.PermissionString[]}
	 */
	const MINIMUM_PERMISSIONS = ['VIEW_CHANNEL', 'SEND_MESSAGES'];

	/**
	 * Test function to determine whether a \<GuildChannel.name> matches the desired `defaultChannel.name`
	 * @param {Discord.GuildChannel} channel The \<GuildChannel> to test
	 * @returns {boolean} Whether the \<GuildChannel.name> matches the desired `defaultChannel.name`
	 */
	const matchesName = channel => channel.name === defaultChannel.name;

	/**
	 * Test function to determine whether Pronto has the minimum desired \<Discord.Permissions> in the \<GuildChannel>
	 * @param {Discord.GuildChannel} channel The \<GuildChannel> to test
	 * @returns {boolean} Whether Pronto has the minimum desired \<Discord.Permissions>, defined by `MINIMUM_PERMISSIONS`, in the specified \<GuildChannel>
	 */
	const hasMinimumPermissions = channel => channel.permissionsFor(bot.user).has(MINIMUM_PERMISSIONS);

	// Attempt to first find a <GuildChannel> that both matches the desired name and where Pronto has the minimum desired permissions, or if none was found, see if there a <GuildChannel> that just matches the name
	const foundChannel = guild.channels.cache.find(channel => matchesName(channel) && hasMinimumPermissions(channel)) || guild.channels.cache.find(matchesName);

	if (foundChannel) {
		// If a <GuildChannel> was found, check whether the current initialiseChannel() call is searching for the guild's debugging channel, where Pronto must have the minimum permissions
		const findingDebugChannel = defaultChannel.name === defaults.debug.name;

		// As long as a <GuildChannel> was found, return its <GuildChannel.id>, unless the current initialiseChannel() call is for the guild's debugging channel and Pronto does not have the minimum permissions
		// If that is the case, ignore the found channel and continue execution to create a new debugging channel
		if (!findingDebugChannel || hasMinimumPermissions(foundChannel)) return foundChannel.id;
	}

	/**
	 * Test function to find a \<CategoryChannel> whose name matches the name defined by [`config.defaults.pronto.name`]{@link config.Configuration}
	 * @param {Discord.GuildChannel} channel The \<GuildChannel> to test
	 * @returns {boolean} Whether the \<GuildChannel> is a \<CategoryChannel> whose name matches [`config.defaults.pronto.name`]{@link config.Configuration}
	 */
	const findProntoCategory = channel => channel.type === 'category' && channel.name === defaults.pronto.name;

	// Attempt to find a <GuildChannel> that matches the name of the Pronto category channel defined by config.defaults.pronto.name, and where Pronto has the minimum desired permissions
	let prontoCategory = guild.channels.cache.find(channel => findProntoCategory(channel) && hasMinimumPermissions(channel));

	if (!prontoCategory) {
		// If the Pronto category channel could not be found, create it for the guild
		await guild.channels.create(defaults.pronto.name, { type: 'category' })
			.then(async channel => {
				// Ensure the bot has VIEW_CHANNEL permissions before hiding the channel for @everyone
				await channel.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
				// Make the created <CategoryChannel> hidden for @everyone
				channel.createOverwrite(guild.roles.everyone, { 'VIEW_CHANNEL': false });
				// Move the created <CategoryChannel> to the top of the channels list
				channel.setPosition(0);

				// Store the created <CategoryChannel> in the prontoCategory variable
				prontoCategory = channel;
			})
			.catch(error => debugError(null, error, `Error creating category '${defaults.pronto.name}' in ${guild.name}\n`));
	}

	// If the channel to be created must be created within a specific category, attempt to find it
	const parent = (defaultChannel.parent)
		? guild.channels.cache.find(channel => channel.type === 'category' && channel.name === defaultChannel.parent)
		: null;

	/**
	 * The dynamically-set \<GuildChannelCreateOptions> for the \<GuildChannel> to create
	 * @type {Discord.GuildChannelCreateOptions}
	 */
	const channelOptions = (defaultChannel.type === 'CATEGORY')
		// If the type of the channel to be created is a <CategoryChannel>, set the <GuildChannelCreateOptions> accordingly
		? { type: defaultChannel.type.toLowerCase() }
		: (parent)
			// Otherwise, if the channel to be created is not a <CategoryChannel> but has a specific parent, set the options accordingly
			? { topic: defaultChannel.description, parent, type: defaultChannel.type.toLowerCase() }
			// Otherwise, create the <GuildChannel> within the prontoCategory <CategoryChannel>
			: { topic: defaultChannel.description, parent: prontoCategory, type: defaultChannel.type.toLowerCase() };

	// Create the <GuildChannel>, using the specified name and appropriate <GuildChannelCreateOptions>
	const createdChannel = await guild.channels.create(defaultChannel.name, channelOptions)
		.catch(error => debugError(null, error, `Error creating ${defaultChannel.name} in ${guild.name}\n`));

	// Record the identifier of the created <GuildChannel> and its <Guild.id> within the createdChannels <Collection>
	createdChannels.set(createdChannel.id, guild.id);

	if (foundChannel) {
		// If the existing debugging channel could not be accessed by Pronto, create and send an embed to the created debugging channel to communicate that
		const debugEmbed = new Discord.MessageEmbed()
			.setColor(colours.error)
			.setDescription(`\n\nI created this channel because I cannot access ${foundChannel}!`);

		sendMsg(createdChannel, { embeds: [debugEmbed] });
	}

	// Return the identifier of the created <GuildChannel>
	return createdChannel.id;
}

/**
 * Finds an existing \<Role> that includes the specified name
 * @function handlers.createGuild~findRole
 * @param {Typings.DefaultRole} defaultRole The \<Role.name> of the role to search for
 * @param {Discord.Guild} guild The \<Guild> to search for the \<Role> in
 * @returns {Discord.Snowflake | ''} The \<Role.id> of the found role, or `''` if it was not found
 */
function findRole(defaultRole, guild) {
	// Attempt to find one <Role.name> which contains the specified name as a substring, and return its identifier if found
	try { return guild.roles.cache.find(role => role.name.toLowerCase().includes(defaultRole.name.toLowerCase())).id; }
	// If no \<Role> was found, simply return an empty string
	catch { return ''; }
}

/**
 * Process a Collection\<GuildChannel.Snowflake, Guild.Snowflake> into a formatted string of channel mentions
 * @function handlers.createGuild~channelsOutput
 * @param {Discord.Collection<Discord.Snowflake, Discord.Snowflake>} collection A Collection\<GuildChannel.Snowflake, Guild.Snowflake> that contains any channels that have been created as part of the current initialisation process(es)
 * @param {Discord.Guild} guild The \<Guild> to output a list of any created channel(s) for
 * @returns {string} A newline-delimited string of formatted channel mentions
 */
function channelsOutput(collection, guild) {
	// Filter the <Collection> for channels created in the specified guild, then map each <GuildChannel.Snowflake> to a new string[] of formatted mentions, and finally join the string[] with a newline separator
	return [...collection.filter(guildId => guildId === guild.id).keys()]
		.map(channel => `<#${channel}>`)
		.join('\n');
}