'use strict';

const Discord = require('discord.js');
const mongoose = require('mongoose');
const Guild = require('../models/guild');

const { config, names, emojis, colours } = require('../config');

const recentlyCreated = new Set();
const createdChannels = new Discord.Collection();

module.exports = async guild => {
	if (!guild) return require('../config');

	const existingGuild = await Guild.findOne({ guildID: guild.id }, error => {
		if (error) console.error(error);
	});

	if (existingGuild) return existingGuild;
	if (recentlyCreated.has(guild.id)) return require('../config');

	recentlyCreated.add(guild.id);
	setTimeout(() => recentlyCreated.delete(guild.guildID), 15000);

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
			debugID: await findChannel(names.debug, guild),
			logID: await findChannel(names.log, guild),
			attendanceID: await findChannel(names.attendance, guild),
			recruitingID: await findChannel(names.recruiting, guild),
			newMembersID: await findChannel(names.newMembers, guild),
			archivedID: await findChannel(names.archived, guild, 'category'),
			exampleTextID: await findChannel(names.exampleText, guild),
			exampleVoiceID: await findChannel(names.exampleVoice, guild, 'voice'),
			everyoneID: guild.roles.everyone.id,
			visitorID: findRole(names.visitor, guild),
			administratorID: '',
			formations: [],
			nonCadet: [],
			tacPlus: [],
			sgtPlus: [],
			cqmsPlus: [],
			adjPlus: [],
		},
		emojis: {
			success: emojis.success,
			error: emojis.error,
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

	await guild.save().catch(error => console.error(error));

	if (createdChannels.some(chnlGuild => chnlGuild === guild.guildID)) {
		const { bot } = require('../pronto');
		const { dtg } = require('../modules');

		const prontoCategory = bot.channels.cache.find(chnl => chnl.type === 'category' && chnl.name === 'Pronto');
		const debugChannel = bot.channels.cache.get(guild.ids.debugID);

		const createdEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL())
			.setColor(colours.pronto)
			.setDescription(`Initialised channel(s) in **${prontoCategory}**, feel free to move and/or rename them!`)
			.addField('Created Channels', channelsOutput(createdChannels, guild))
			.addField('More Information', 'To modify my configuration, please visit my dashboard.')
			.setFooter(await dtg());

		debugChannel.send(createdEmbed).catch(error => console.error(error));
	}

	return guild;
};

async function findChannel(channel, guild, type) {
	const { bot } = require('../pronto');

	const everyone = guild.roles.everyone;
	const minPerms = ['VIEW_CHANNEL', 'SEND_MESSAGES'];

	const hasMinPerms = chnl => chnl.name === channel && chnl.permissionsFor(bot.user).has(minPerms);
	const hasChannel = chnl => chnl.name === channel;

	const foundChannel = guild.channels.cache.find(hasMinPerms) || guild.channels.cache.find(hasChannel);

	if (foundChannel) {
		if (foundChannel.permissionsFor(bot.user).has(minPerms) || channel !== names.debug) return foundChannel.id;
	}

	let prontoCategory = guild.channels.cache.find(chnl => chnl.type === 'category' && chnl.name === 'Pronto');

	if (!prontoCategory) {
		await guild.channels.create('Pronto', { type: 'category' })
			.then(async chnl => {
				await chnl.createOverwrite(bot.user.id, { 'VIEW_CHANNEL': true });
				await chnl.createOverwrite(everyone, { 'VIEW_CHANNEL': false });
				await chnl.setPosition(0);
				prontoCategory = chnl;
			})
			.catch(error => console.error(`Error creating category 'Pronto' in ${guild.name} \n${error}`));
	}

	const chnlOptions = (type === 'category')
		? { type: type }
		: { parent: prontoCategory, type: type };

	const newChannel = await guild.channels.create(channel, chnlOptions)
		.catch(error => console.error(`Error creating ${channel} in ${guild.name} \n${error}`));

	createdChannels.set(newChannel.id, guild.id);
	setTimeout(() => createdChannels.delete(newChannel.id), 5000);

	if (foundChannel) {
		if (foundChannel.name === names.debug) {
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