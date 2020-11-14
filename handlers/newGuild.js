'use strict';

const Discord = require('discord.js');
const Guild = require('../models/guild');

const { ids, defaults, colours } = require('../config');

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
	const { lessonInstructions, overwriteCommands } = require('./');

	let _guild = await createGuild(guild);
	_guild = await overwriteCommands(guild);

	lessonInstructions(_guild.ids.lessonInstructionsID, guild);

	if (createdChannels.some(guildID => guildID === guild.id)) {
		const { dtg } = require('../modules');

		const prontoCategory = bot.channels.cache.find(chnl => chnl.type === 'category' && chnl.name === defaults.pronto.name);
		const logChannel = bot.channels.cache.get(_guild.ids.logID);

		const createdEmbed = new Discord.MessageEmbed()
			.setAuthor(bot.user.tag, bot.user.avatarURL({ dynamic: true }))
			.setColor(colours.pronto)
			.setDescription(`Initialised channel(s) in **${prontoCategory}**, feel free to move and/or rename them!`)
			.addField('Created Channels', channelsOutput(createdChannels, _guild))
			.addField('More Information', 'To modify my configuration, please visit my dashboard.')
			.setFooter(await dtg());

		logChannel.send(createdEmbed).catch(error => console.error(error));
	}

	return _guild;
};

async function createGuild(guild) {
	guild = await new Guild({
		guildID: guild.id,
		guildName: guild.name,
		ids: {
			serverID: guild.id,
			debugID: await initChannel(defaults.debug, guild),
			logID: await initChannel(defaults.log, guild),
			attendanceID: await initChannel(defaults.attendance, guild),
			recruitingID: await initChannel(defaults.recruiting, guild),
			newMembersID: await initChannel(defaults.newMembers, guild),
			archivedID: await initChannel(defaults.archived, guild, 'category'),
			lessonsID: await initChannel(defaults.lessons, guild, 'category'),
			lessonInstructionsID: await initChannel(defaults.instructions, guild),
			lessonPlansID: await initChannel(defaults.lessonPlans, guild),
			exampleTextID: await initChannel(defaults.exampleText, guild),
			exampleVoiceID: await initChannel(defaults.exampleVoice, guild, 'voice'),
			everyoneID: guild.roles.everyone.id,
			visitorID: findRole(defaults.visitor, guild),
		},
	});

	return await guild.save().catch(error => console.error(error));
}

async function initChannel(channel, guild, type) {
	const { bot } = require('../pronto');

	if (channel === defaults.debug && guild.id !== ids.defaultServer) return '';

	const chnls = guild.channels.cache;
	const everyone = guild.roles.everyone;
	const minPerms = ['VIEW_CHANNEL', 'SEND_MESSAGES'];

	const hasChannel = chnl => chnl.name === channel.name;
	const hasMinPerms = chnl => chnl.permissionsFor(bot.user).has(minPerms);

	const foundChannel = chnls.find(chnl => hasChannel(chnl) && hasMinPerms(chnl)) || chnls.find(hasChannel);

	if (foundChannel) {
		const isLogChannel = channel.name === defaults.log.name;

		if (hasMinPerms(foundChannel) || !isLogChannel) return foundChannel.id;
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
			.catch(error => console.error(`Error creating category '${defaults.pronto.name}' in ${guild.name}\n`, error));
	}

	const parent = (channel.parent)
		? chnls.find(chnl => chnl.type === 'category' && chnl.name === channel.parent)
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
		if (foundChannel.name === defaults.log.name) {
			const logEmbed = new Discord.MessageEmbed()
				.setColor(colours.error)
				.setDescription(`\n\nI created this channel because I cannot access ${foundChannel}!`);

			newChannel.send(logEmbed).catch(error => console.error(error));
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