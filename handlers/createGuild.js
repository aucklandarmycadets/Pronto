'use strict';

const Discord = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Typings = require('../typings');
const mongoose = require('mongoose');

const { defaults, colours } = require('../config');
const { Guild } = require('../models');
const { debugError, sendMsg } = require('../modules');

/**
 * A Collection\<Channel.Snowflake, Guild.Snowflake> to store any channels that have been created by Pronto as part of the initialisation process
 * @type {Discord.Collection<Discord.Snowflake, Discord.Snowflake}
 */
const createdChannels = new Discord.Collection();

/**
 * - Set to record the \<Guild.id> snowflakes of the guild currently undergoing creation
 * - If a guild's snowflake is currently in this set, they must await until the Promises stored within the values of pendingPromises[\<Guild.id>] resolve for the \<Guild> document to be accessible
 * @type {Set<Discord.Snowflake>}
 */
const currentlyCreating = new Set();

/**
 * - An \<Object> to record all pending Promises, stored as an \<Object.\<string, Promise\<*>>> in the property pendingPromises[\<Guild.id>]
 * - A guild's \<Guild> document is only guaranteed to be accessible once all Promises within `Object.values(pendingPromises[<Guild.id>])` have been resolved
 * @type {Object.<string, Object.<string, Promise<*>>}
 */
const pendingPromises = {};

/**
 * `handlers.createGuild()` performs the initialisation process for a guild by creating/finding the default channels defined by `config.defaults`,
 * and creates and returns a new \<Guild> document if it does not already exist
 * @param {Discord.Guild} guild The guild to initialise
 * @returns {Promise<Typings.Guild>} The guild's \<Guild> document
 */
module.exports = async guild => {
	/**
	 * Attempt to find an existing \<Guild> document by querying for the guild's identifer
	 * @type {?Typings.Guild}
	 */
	const existingDocument = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	// If the guild already has an existing <Guild> document, return it and cease further execution
	if (existingDocument) return existingDocument;

	if (currentlyCreating.has(guild.id)) {
		// If the guild's identifier already exists inside the currentlyCreated set, await until the guild's pending Promises resolve for the <Guild> document to be accessible
		await Promise.all(Object.values(pendingPromises[guild.id]));
		// Recursively call handlers.createGuild() to return the created <Guild> document
		return await this(guild);
	}

	// Add the guild's identifier to the currentlyCreating set
	currentlyCreating.add(guild.id);

	const { bot } = require('../pronto');
	const { lessonInstructions, overwriteCommands } = require('./');

	// Call createGuildDocument() to create the guild's initial <Guild> document, and wait for the document to be saved before proceeding
	// This is done by saving the Promise in an object within pendingPromises[guild.id], then waiting for that Promise to resolve
	pendingPromises[guild.id] = { createGuildDocument: createGuildDocument(guild) };
	await Promise.resolve(pendingPromises[guild.id].createGuildDocument);

	// Once the initial <Guild> document has been created, call handlers.overwriteCommands() to upsert <Guild.commands>, and save the Promise
	pendingPromises[guild.id].overwriteCommands = overwriteCommands(guild);
	await Promise.resolve(pendingPromises[guild.id].overwriteCommands);

	// Once the handlers.overwriteCommands() Promise has resolved, retrieve the complete <Guild> document from its resolved value
	const guildDocument = pendingPromises[guild.id].overwriteCommands;

	// Remove the guild's identifier from the currentlyCreating set now that the <Guild> document has been created
	currentlyCreating.delete(guild.id);

	// Call handlers.lessonInstructions() to send an instructional embed on Pronto's lesson management functionality
	lessonInstructions(guildDocument.ids.lessonReferenceID, guild);

	// If this guild has had some channels created as part of the initialisation process, send an embed listing the created channels
	if (createdChannels.some(guildID => guildID === guild.id)) {
		const { dateTimeGroup } = require('../modules');

		// Retrieve the <CategoryChannel> that was created by Pronto to categorise Pronto's created channels
		const prontoCategory = bot.channels.cache.find(channel => channel.type === 'category' && channel.name === defaults.pronto.name);
		// Get the guild's debug channel
		const debugChannel = bot.channels.cache.get(guildDocument.ids.debugID);

		// Create created channels embed
		const createdChannelsEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setColor(colours.primary)
			.setDescription(`Initialised channel(s) in **${prontoCategory}**, feel free to move and/or rename them!`)
			.addField('Created Channels', channelsOutput(createdChannels, guildDocument))
			.addField('More Information', 'To modify my configuration, please visit my dashboard.')
			.setFooter(await dateTimeGroup());

		// Send the created channels embed
		sendMsg(debugChannel, { embeds: [createdChannelsEmbed] });
	}

	// Filter the createdChannels <Collection> for channels created in this guild, and delete them from the <Collection> now that we are done with them
	[...createdChannels.filter(guildID => guildID === guild.id).keys()]
		.forEach(channelID => createdChannels.delete(channelID));

	// Delete the guild's property from the pendingPromises <Object> now that we are done with it
	delete pendingPromises[guild.id];

	// Return the created <Guild> document
	return guildDocument;
};

async function createGuildDocument(guild) {
	/**
	 * @type {Typings.Guild}
	 */
	const guildDocument = await new Guild({
		_id: mongoose.Types.ObjectId(),
		guildID: guild.id,
		guildName: guild.name,
		ids: {
			guildID: guild.id,
			debugID: await initChannel(defaults.debug, guild),
			logID: await initChannel(defaults.log, guild),
			attendanceID: await initChannel(defaults.attendance, guild),
			recruitingID: await initChannel(defaults.recruiting, guild),
			welcomeID: await initChannel(defaults.welcome, guild),
			archivedID: await initChannel(defaults.archived, guild, 'category'),
			lessonsID: await initChannel(defaults.lessons, guild, 'category'),
			lessonReferenceID: await initChannel(defaults.lessonReference, guild),
			lessonPlansID: await initChannel(defaults.lessonPlans, guild),
			everyoneID: guild.roles.everyone.id,
			visitorID: findRole(defaults.visitor, guild),
		},
	});

	return await guildDocument.save().catch(error => console.error(error));
}

async function initChannel(channel, guild, type) {
	const { bot } = require('../pronto');

	const chnls = guild.channels.cache;
	const everyone = guild.roles.everyone;
	const minPerms = ['VIEW_CHANNEL', 'SEND_MESSAGES'];

	const hasChannel = chnl => chnl.name === channel.name;
	const hasMinPerms = chnl => chnl.permissionsFor(bot.user).has(minPerms);

	const foundChannel = chnls.find(chnl => hasChannel(chnl) && hasMinPerms(chnl)) || chnls.find(hasChannel);

	if (foundChannel) {
		const isDebugChannel = channel.name === defaults.debug.name;

		if (hasMinPerms(foundChannel) || !isDebugChannel) return foundChannel.id;
	}

	const findProntoCategory = chnl => chnl.type === 'category' && chnl.name === defaults.pronto.name;

	let prontoCategory = chnls.find(chnl => findProntoCategory(chnl) && hasMinPerms(chnl));

	if (!prontoCategory) {
		await guild.channels.create(defaults.pronto.name, { type: 'category' })
			.then(async chnl => {
				await chnl.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
				chnl.createOverwrite(everyone, { 'VIEW_CHANNEL': false });
				chnl.setPosition(0);
				prontoCategory = chnl;
			})
			.catch(error => debugError(error, `Error creating category '${defaults.pronto.name}' in ${guild.name}\n`));
	}

	const parent = (channel.parent)
		? chnls.find(chnl => chnl.type === 'category' && chnl.name === channel.parent)
		: null;

	const chnlOptions = (type === 'category')
		? { type: type }
		: (parent)
			? { topic: channel.description, parent: parent, type: type }
			: { topic: channel.description, parent: prontoCategory, type: type };

	const newChannel = await guild.channels.create(channel.name, chnlOptions)
		.catch(error => debugError(error, `Error creating ${channel.name} in ${guild.name}\n`));

	createdChannels.set(newChannel.id, guild.id);

	if (foundChannel) {
		if (foundChannel.name === defaults.debug.name) {
			const debugEmbed = new Discord.MessageEmbed()
				.setColor(colours.error)
				.setDescription(`\n\nI created this channel because I cannot access ${foundChannel}!`);

			sendMsg(newChannel, { embeds: [debugEmbed] });
		}
	}

	return newChannel.id;
}

function findRole(name, guild) {
	try { return guild.roles.cache.find(role => role.name.toLowerCase().includes(name.toLowerCase())).id; }
	catch { return ''; }
}

function channelsOutput(collection, guild) {
	// Filter the <Collection> for channels created in the specified guild
	return [...collection.filter(_guild => _guild === guild.guildID).keys()]
		.map(channel => `<#${channel}>`)
		.join('\n');
}