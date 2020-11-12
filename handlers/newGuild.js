'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');
const Guild = require('../models/guild');

const { config, defaults, emojis, colours } = require('../config');

const recentlyCreated = new Set();
const createdChannels = new Discord.Collection();

module.exports = async guild => {
	if (!guild) {
		const returnObj = require('../config');
		returnObj.cmds = await require('../cmds')('break');
		return returnObj;
	}

	const existingGuild = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	if (existingGuild) return existingGuild;
	if (recentlyCreated.has(guild.id)) return require('../config');

	recentlyCreated.add(guild.id);
	setTimeout(() => recentlyCreated.delete(guild.guildID), 15000);

	const { bot } = require('../pronto');
	const { overwriteCommands } = require('./');

	guild = await createGuild(guild);
	guild = await overwriteCommands({ id: guild.guildID });

	if (createdChannels.some(chnlGuild => chnlGuild === guild.guildID)) {
		const { dtg } = require('../modules');

		const prontoCategory = bot.channels.cache.find(chnl => chnl.type === 'category' && chnl.name === defaults.pronto.name);
		const debugChannel = bot.channels.cache.get(guild.ids.debugID);

		const createdEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setColor(colours.pronto)
			.setDescription(`Initialised channel(s) in **${prontoCategory}**, feel free to move and/or rename them!`)
			.addField('Created Channels', channelsOutput(createdChannels, guild))
			.addField('More Information', 'To modify my configuration, please visit my dashboard.')
			.setFooter(await dtg());

		debugChannel.send(createdEmbed).catch(error => console.error(error));
	}

	return guild;
};

async function createGuild(guild) {
	guild = await new Guild({
		_id: mongoose.Types.ObjectId(),
		guildID: guild.id,
		guildName: guild.name,
		config: {
			prefix: config.prefix,
			dateOutput: config.dateOutput,
			prontoLogo: config.prontoLogo,
		},
		ids: {
			serverID: guild.id,
			debugID: await findChannel(defaults.debug, guild),
			logID: await findChannel(defaults.log, guild),
			attendanceID: await findChannel(defaults.attendance, guild),
			recruitingID: await findChannel(defaults.recruiting, guild),
			newMembersID: await findChannel(defaults.newMembers, guild),
			archivedID: await findChannel(defaults.archived, guild, 'category'),
			lessonsID: await findChannel(defaults.lessons, guild, 'category'),
			lessonPlansID: await findChannel(defaults.lessonPlans, guild),
			exampleTextID: await findChannel(defaults.exampleText, guild),
			exampleVoiceID: await findChannel(defaults.exampleVoice, guild, 'voice'),
			everyoneID: guild.roles.everyone.id,
			visitorID: findRole(defaults.visitor, guild),
			administratorID: '',
			trainingIDs: '',
			formations: [],
			channelPairs: [],
		},
		cmds: {},
		emojis: {
			success: {
				name: emojis.success.name,
				URL: emojis.success.URL,
			},
			error: {
				name: emojis.error.name,
				URL: emojis.error.URL,
			},
		},
		colours: {
			default: colours.default,
			pronto: colours.pronto,
			leave: colours.leave,
			success: colours.success,
			warn: colours.warn,
			error: colours.error,
		},
	});

	return await guild.save().catch(error => console.error(error));
}

async function findChannel(channel, guild, type) {
	const { bot } = require('../pronto');

	const everyone = guild.roles.everyone;
	const minPerms = ['VIEW_CHANNEL', 'SEND_MESSAGES'];

	const hasMinPerms = chnl => chnl.name === channel.name && chnl.permissionsFor(bot.user).has(minPerms);
	const hasChannel = chnl => chnl.name === channel.name;

	const foundChannel = guild.channels.cache.find(hasMinPerms) || guild.channels.cache.find(hasChannel);

	if (foundChannel) {
		if (foundChannel.permissionsFor(bot.user).has(minPerms) || channel.name !== defaults.debug.name) return foundChannel.id;
	}

	let prontoCategory = guild.channels.cache.find(chnl => chnl.type === 'category' && chnl.name === defaults.pronto.name);

	if (!prontoCategory) {
		await guild.channels.create(defaults.pronto.name, { type: 'category' })
			.then(async chnl => {
				await chnl.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
				chnl.createOverwrite(everyone, { 'VIEW_CHANNEL': false });
				chnl.setPosition(0);
				prontoCategory = chnl;
			})
			.catch(error => console.error(`Error creating category '${defaults.pronto.name}' in ${guild.name}\n`, error));
	}

	const parent = (channel.parent)
		? guild.channels.cache.find(chnl => chnl.type === 'category' && chnl.name === channel.parent)
		: null;

	const chnlOptions = (type === 'category')
		? { type: type }
		: (parent)
			? { topic: channel.desc, parent: parent, type: type }
			: { topic: channel.desc, parent: prontoCategory, type: type };

	const newChannel = await guild.channels.create(channel.name, chnlOptions)
		.catch(error => console.error(`Error creating ${channel.name} in ${guild.name}\n`, error));

	createdChannels.set(newChannel.id, guild.id);
	setTimeout(() => createdChannels.delete(newChannel.id), 5000);

	if (foundChannel) {
		if (foundChannel.name === defaults.debug.name) {
			const debugEmbed = new Discord.MessageEmbed()
				.setColor(colours.error)
				.setDescription(`\n\nI created this channel because I cannot access ${foundChannel}!`);

			newChannel.send(debugEmbed).catch(error => console.error(error));
		}
	}

	return newChannel.id;
}

function findRole(name, guild) {
	try { return guild.roles.cache.find(role => role.name.toLowerCase().includes(name.toLowerCase())).id; }
	catch { return ''; }
}

function channelsOutput(collection, guild) {
	let chnlsList = '';

	const chnls = [...collection.filter(chnlGuild => chnlGuild === guild.guildID).keys()];

	for (let i = 0; i < chnls.length; i++) {
		chnlsList += `<#${chnls[i]}>\n`;
	}

	return chnlsList;
}